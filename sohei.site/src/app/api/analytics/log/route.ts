import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { page, referrer, screenSize, language } = await request.json();
    if (!page) {
      return NextResponse.json({ error: 'ページ名が必要です' }, { status: 400 });
    }

    await prisma.visitorLog.create({
      data: {
        page,
        userAgent: request.headers.get('user-agent') || null,
        ipAddress: request.headers.get('x-forwarded-for') || null,
        referrer: referrer || null,
        screenSize: screenSize || null,
        language: language || null,
      },
    });

    return NextResponse.json({ message: 'ok' });
  } catch (err) {
    console.error('Log visit error:', err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
