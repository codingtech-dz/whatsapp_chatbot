import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getUserId(request: Request): string | null {
  return request.headers.get('x-user-id');
}

export async function PUT(request: Request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : undefined;
    const goal = typeof body?.goal === 'string' ? body.goal.trim() : undefined;
    const systemPrompt =
      typeof body?.systemPrompt === 'string' ? body.systemPrompt.trim() : undefined;
    const rules = typeof body?.rules === 'string' ? body.rules.trim() : undefined;
    const knowledgeText =
      typeof body?.knowledgeText === 'string' ? body.knowledgeText.trim() : undefined;
    const isActive = typeof body?.isActive === 'boolean' ? body.isActive : undefined;

    const existingBot = await prisma.bot.findFirst({ where: { userId } });
    if (!existingBot) {
      return NextResponse.json({ error: 'Bot not found. Create a bot first.' }, { status: 404 });
    }

    const bot = await prisma.bot.update({
      where: { id: existingBot.id },
      data: {
        name,
        goal,
        systemPrompt,
        rules,
        knowledgeText,
        isActive,
      },
    });

    return NextResponse.json(bot, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
