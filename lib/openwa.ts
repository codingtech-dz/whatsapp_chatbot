import path from 'path';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import { create, Client, ev } from '@open-wa/wa-automate';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import { generateAIResponse } from '@/lib/openai';

type WaStatus = 'idle' | 'starting' | 'qr' | 'connected' | 'error';

type WaState = {
  client: Client | null;
  status: WaStatus;
  latestQr: string | null;
  events: EventEmitter;
  starting: Promise<Client> | null;
  qrListenerAttached?: boolean;
};

const globalForWa = global as unknown as { waState?: WaState };

if (!globalForWa.waState) {
  globalForWa.waState = {
    client: null,
    status: 'idle',
    latestQr: null,
    events: new EventEmitter(),
    starting: null,
  };
}

const state = globalForWa.waState;
const sessionDir = process.env.WA_SESSION_PATH || path.join(process.cwd(), 'openwa-sessions');
const stateFile = path.join(sessionDir, 'wa-state.json');

async function persistState() {
  try {
    await fs.mkdir(sessionDir, { recursive: true });
    await fs.writeFile(
      stateFile,
      JSON.stringify({ status: state.status, latestQr: state.latestQr }),
      'utf8'
    );
  } catch (err) {
    console.error('OpenWA state persist error:', err);
  }
}

function setStatus(status: WaStatus) {
  state.status = status;
  state.events.emit('status', status);
  persistState();
}

async function handleQrEvent(qrcode: string) {
  const dataUrl = await ensureQrDataUrl(qrcode, undefined);
  if (dataUrl) {
    state.latestQr = dataUrl;
    setStatus('qr');
    state.events.emit('qr', dataUrl);
    persistState();
  }
}

export async function getWaState() {
  if (state.latestQr || state.status !== 'starting') {
    return { status: state.status, latestQr: state.latestQr };
  }
  try {
    const raw = await fs.readFile(stateFile, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed?.status) state.status = parsed.status;
    if (parsed?.latestQr) state.latestQr = parsed.latestQr;
  } catch {
    // ignore if missing
  }
  return { status: state.status, latestQr: state.latestQr };
}

async function ensureQrDataUrl(qrCode: string | undefined, urlCode: string | undefined) {
  if (qrCode && qrCode.startsWith('data:image')) {
    return qrCode;
  }
  if (qrCode && /^[A-Za-z0-9+/=]+$/.test(qrCode) && qrCode.length > 200) {
    return `data:image/png;base64,${qrCode}`;
  }
  if (qrCode) return QRCode.toDataURL(qrCode);
  if (urlCode) return QRCode.toDataURL(urlCode);
  return null;
}

export async function ensureWaClient() {
  if (state.client) return state.client;
  if (state.starting) return state.starting;

  setStatus('starting');

  const candidatePaths = [
    process.env.WA_CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
  ].filter(Boolean) as string[];

  let chromePath: string | undefined;
  for (const p of candidatePaths) {
    try {
      await fs.access(p);
      chromePath = p;
      break;
    } catch {
      continue;
    }
  }

  if (!chromePath) {
    console.error('OpenWA: No Chromium executable found.', { candidatePaths });
  }

  if (!state.qrListenerAttached) {
    state.qrListenerAttached = true;
    ev.on('qr.**', handleQrEvent);
  }

  const chromiumArgs = process.env.WA_CHROMIUM_ARGS
    ? process.env.WA_CHROMIUM_ARGS.split(',').map((v) => v.trim()).filter(Boolean)
    : undefined;

  if (chromiumArgs?.length) {
    console.log('OpenWA: using custom chromium args:', chromiumArgs);
  }

  state.starting = create({
    sessionId: 'saas-whatsapp',
    multiDevice: true,
    headless: true,
    qrTimeout: 0,
    authTimeout: 60,
    sessionDataPath: sessionDir,
    useChrome: true,
    executablePath: chromePath,
    chromiumArgs,
    qrCallback: async (qrCode: string, _asciiQR: string, _attempt: number, urlCode?: string) => {
      const dataUrl = await ensureQrDataUrl(qrCode, urlCode);
      if (dataUrl) {
        state.latestQr = dataUrl;
        setStatus('qr');
        state.events.emit('qr', dataUrl);
        persistState();
      }
    },
  })
    .then((client) => {
      state.client = client;
      setStatus('connected');

      client.onStateChanged((newState) => {
        if (newState === 'CONNECTED') {
          setStatus('connected');
        }
      });

      client.onMessage(async (message) => {
        try {
          if (!message?.body) return;

          const bot = await prisma.bot.findFirst();
          if (!bot) return;

          if (!bot.isActive) {
            await prisma.bot.update({
              where: { id: bot.id },
              data: { isActive: true },
            });
          }

          const reply = await generateAIResponse(
            bot.systemPrompt,
            bot.goal,
            bot.rules,
            bot.knowledgeText,
            message.body
          );

          await client.sendText(message.from, reply);

          await prisma.conversation.upsert({
            where: {
              botId_fromNumber: {
                botId: bot.id,
                fromNumber: message.from,
              },
            },
            update: { lastMessage: message.body },
            create: {
              botId: bot.id,
              fromNumber: message.from,
              lastMessage: message.body,
            },
          });
        } catch (err) {
          console.error('OpenWA message error:', err);
        }
      });

      return client;
    })
    .catch((err) => {
      console.error('OpenWA init error:', err);
      setStatus('error');
      throw err;
    })
    .finally(() => {
      state.starting = null;
    });

  return state.starting;
}

export const waEvents = state.events;

export async function disconnectWa() {
  try {
    if (state.client) {
      await state.client.logout();
      const maybeClient = state.client as unknown as {
        close?: () => Promise<void>;
        kill?: () => Promise<void>;
      };
      if (maybeClient.close) {
        await maybeClient.close();
      } else if (maybeClient.kill) {
        await maybeClient.kill();
      }
    }
  } catch (err) {
    console.error('OpenWA disconnect error:', err);
  } finally {
    state.client = null;
    state.latestQr = null;
    setStatus('idle');
    try {
      await fs.rm(sessionDir, { recursive: true, force: true });
    } catch (err) {
      console.error('OpenWA session cleanup error:', err);
    }
  }
}

export async function reconnectWa() {
  await disconnectWa();
  return ensureWaClient();
}
