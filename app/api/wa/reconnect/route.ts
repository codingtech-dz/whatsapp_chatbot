import { reconnectWa } from '@/lib/openwa';

export const runtime = 'nodejs';

export async function POST() {
  await reconnectWa();
  return Response.json({ success: true });
}
