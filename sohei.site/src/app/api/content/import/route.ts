import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;

    let data: Record<string, Record<string, string>>;
    try {
      data = await request.json();
    } catch {
      return NextResponse.json({ error: 'リクエストの形式が不正です' }, { status: 400 });
    }

    const allEntries: { page: string; key: string; value: string }[] = [];
    for (const [page, entries] of Object.entries(data)) {
      for (const [key, value] of Object.entries(entries)) {
        allEntries.push({ page, key, value: String(value) });
      }
    }

    // Use interactive transaction with extended timeout for bulk import
    await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        for (const { page, key, value } of allEntries) {
          await tx.content.upsert({
            where: { page_key: { page, key } },
            update: { value },
            create: { page, key, value },
          });
        }
      },
      { timeout: 60000, maxWait: 10000 },
    );

    return NextResponse.json({
      message: 'コンテンツをインポートしました',
      count: allEntries.length,
    });
  } catch (err) {
    console.error('Import content error:', err);
    const detail = err instanceof Error ? err.message : undefined;
    return NextResponse.json({ error: 'インポート中にエラーが発生しました', detail }, { status: 500 });
  }
}
