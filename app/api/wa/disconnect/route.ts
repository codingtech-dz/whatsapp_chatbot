import { disconnectWa } from '@/lib/openwa';

export const runtime = 'nodejs';

export async function POST() {
  await disconnectWa();
  return Response.json({ success: true });
}
