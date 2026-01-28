import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;

    const data = await request.json();

    const operations: ReturnType<typeof prisma.content.upsert>[] = [];
    for (const [page, entries] of Object.entries(data)) {
      for (const [key, value] of Object.entries(entries as Record<string, string>)) {
        operations.push(
          prisma.content.upsert({
            where: { page_key: { page, key } },
            update: { value: String(value) },
            create: { page, key, value: String(value) },
          })
        );
      }
    }

    await prisma.$transaction(operations);
    return NextResponse.json({ message: 'コンテンツをインポートしました', count: operations.length });
  } catch (err) {
    console.error('Import content error:', err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
