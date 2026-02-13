import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@/lib/encryption';
import {
  parseWhatsAppWebhook,
  sendWhatsAppMessage,
  verifyWebhookSignature,
  WEBHOOK_VERIFY_TOKEN,
} from '@/lib/whatsapp';
import { generateAIResponse } from '@/lib/openai';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const body = JSON.parse(rawBody);
    const messages = parseWhatsAppWebhook(body);

    for (const message of messages) {
      const bot = await prisma.bot.findFirst({
        where: { phoneNumberId: message.phoneNumberId },
      });

      if (!bot || !bot.accessToken) {
        continue;
      }

      const reply = await generateAIResponse(
        bot.systemPrompt,
        bot.goal,
        bot.rules,
        bot.knowledgeText,
        message.text
      );

      const accessToken = decryptToken(bot.accessToken);
      await sendWhatsAppMessage(message.phoneNumberId, message.from, reply, accessToken);

      await prisma.conversation.upsert({
        where: {
          botId_fromNumber: {
            botId: bot.id,
            fromNumber: message.from,
          },
        },
        update: { lastMessage: message.text },
        create: {
          botId: bot.id,
          fromNumber: message.from,
          lastMessage: message.text,
        },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
