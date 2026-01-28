import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureConnection } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await ensureConnection();
    const contents = await prisma.content.findMany({
      orderBy: [{ page: 'asc' }, { key: 'asc' }],
    });

    const grouped: Record<string, Record<string, string>> = {};
    for (const item of contents) {
      if (!grouped[item.page]) {
        grouped[item.page] = {};
      }
      grouped[item.page][item.key] = item.value;
    }

    return NextResponse.json(grouped);
  } catch (err) {
    console.error('Get content error:', err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;

    await ensureConnection();
    const deleteResult = await prisma.content.deleteMany();
    return NextResponse.json({ message: '全コンテンツを削除しました', count: deleteResult.count });
  } catch (err) {
    console.error('Delete content error:', err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
