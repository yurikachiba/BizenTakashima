import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ page: string }> }) {
  try {
    const { page } = await params;
    const contents = await prisma.content.findMany({
      where: { page },
    });

    const result: Record<string, string> = {};
    for (const item of contents) {
      result[item.key] = item.value;
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Get page content error:', err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ page: string }> }) {
  try {
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { page } = await params;

    let data: Record<string, unknown>;
    try {
      data = await request.json();
    } catch {
      return NextResponse.json({ error: 'リクエストの形式が不正です' }, { status: 400 });
    }

    const entries = Object.entries(data);
    if (entries.length === 0) {
      return NextResponse.json({ message: '保存するコンテンツがありません' });
    }

    // Try interactive transaction first, fall back to individual upserts on connection error
    try {
      await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          for (const [key, value] of entries) {
            await tx.content.upsert({
              where: { page_key: { page, key } },
              update: { value: String(value) },
              create: { page, key, value: String(value) },
            });
          }
        },
        { timeout: 30000, maxWait: 10000 },
      );
      return NextResponse.json({ message: `${page}のコンテンツを保存しました` });
    } catch (txErr) {
      console.warn('Transaction save failed, retrying with individual upserts:', txErr);
    }

    // Fallback: reconnect and save entries individually
    try {
      await prisma.$disconnect();
    } catch {
      /* ignore disconnect error */
    }

    for (const [key, value] of entries) {
      await prisma.content.upsert({
        where: { page_key: { page, key } },
        update: { value: String(value) },
        create: { page, key, value: String(value) },
      });
    }

    return NextResponse.json({ message: `${page}のコンテンツを保存しました` });
  } catch (err) {
    console.error('Update content error:', err);
    const detail = err instanceof Error ? err.message : undefined;
    return NextResponse.json({ error: 'コンテンツの保存中にエラーが発生しました', detail }, { status: 500 });
  }
}
