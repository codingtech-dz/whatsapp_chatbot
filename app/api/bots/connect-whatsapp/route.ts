import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptToken } from '@/lib/encryption';

function getUserId(request: Request): string | null {
  return request.headers.get('x-user-id');
}

export async function POST(request: Request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const phoneNumberId = typeof body?.phoneNumberId === 'string' ? body.phoneNumberId.trim() : '';
    const wabaId = typeof body?.wabaId === 'string' ? body.wabaId.trim() : '';
    const accessToken = typeof body?.accessToken === 'string' ? body.accessToken.trim() : '';

    if (!phoneNumberId || !wabaId || !accessToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingBot = await prisma.bot.findFirst({ where: { userId } });
    if (!existingBot) {
      return NextResponse.json({ error: 'Bot not found. Create a bot first.' }, { status: 404 });
    }

    const bot = await prisma.bot.update({
      where: { id: existingBot.id },
      data: {
        phoneNumberId,
        wabaId,
        accessToken: encryptToken(accessToken),
      },
    });

    return NextResponse.json(
      { message: 'WhatsApp account connected successfully', bot },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
