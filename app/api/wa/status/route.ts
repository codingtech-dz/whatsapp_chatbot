import { ensureWaClient, getWaState } from '@/lib/openwa';

export const runtime = 'nodejs';

export async function GET() {
  ensureWaClient().catch((err) => {
    console.error('OpenWA startup error:', err);
  });
  const state = await getWaState();
  return Response.json(state);
}
