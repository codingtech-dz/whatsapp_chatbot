import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getUserId(request: Request): string | null {
  return request.headers.get('x-user-id');
}

export async function GET(request: Request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bot = await prisma.bot.findFirst({ where: { userId } });
    return NextResponse.json(bot ?? null, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const goal = typeof body?.goal === 'string' ? body.goal.trim() : '';
    const systemPrompt = typeof body?.systemPrompt === 'string' ? body.systemPrompt.trim() : '';
    const rules = typeof body?.rules === 'string' ? body.rules.trim() : '';
    const knowledgeText = typeof body?.knowledgeText === 'string' ? body.knowledgeText.trim() : '';

    if (!name || !goal || !systemPrompt || !rules) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingBot = await prisma.bot.findFirst({ where: { userId } });
    if (existingBot) {
      return NextResponse.json(
        { error: 'You already have a bot. Edit your existing bot instead.' },
        { status: 400 }
      );
    }

    const bot = await prisma.bot.create({
      data: {
        userId,
        name,
        goal,
        systemPrompt,
        rules,
        knowledgeText,
      },
    });

    return NextResponse.json(bot, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
