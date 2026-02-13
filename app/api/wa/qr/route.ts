import { ensureWaClient, getWaState, waEvents } from '@/lib/openwa';

export const runtime = 'nodejs';

export async function GET() {
  ensureWaClient().catch((err) => {
    console.error('OpenWA startup error:', err);
  });
  const state = await getWaState();
  const encoder = new TextEncoder();

  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      if (state.status) {
        send('status', { status: state.status });
      }
      if (state.latestQr) {
        send('qr', { dataUrl: state.latestQr });
      }

      const onQr = (dataUrl: string) => send('qr', { dataUrl });
      const onStatus = (status: string) => send('status', { status });

      waEvents.on('qr', onQr);
      waEvents.on('status', onStatus);

      const ping = setInterval(() => {
        send('ping', {});
      }, 15000);

      cleanup = () => {
        clearInterval(ping);
        waEvents.off('qr', onQr);
        waEvents.off('status', onStatus);
      };
    },
    cancel() {
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
