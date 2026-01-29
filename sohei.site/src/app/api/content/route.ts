import { NextRequest, NextResponse } from 'next/server';
import { prisma, withTimeout } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const DB_TIMEOUT_MS = 5000;

export async function GET() {
  try {
    const contents = await withTimeout(prisma.content.findMany({
      orderBy: [{ page: 'asc' }, { key: 'asc' }],
    }), DB_TIMEOUT_MS);

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
    const errObj = err as { code?: string };
    if (errObj.code === 'DATABASE_COLD_START') {
      return NextResponse.json(
        {
          error: 'データベースが起動中です',
          detail: 'データベースがスリープ状態から復帰中です。数秒後に再度お試しください。',
          retryable: true,
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;

    const deleteResult = await withTimeout(prisma.content.deleteMany(), DB_TIMEOUT_MS);
    return NextResponse.json({ message: '全コンテンツを削除しました', count: deleteResult.count });
  } catch (err) {
    console.error('Delete content error:', err);
    const errObj = err as { code?: string };
    if (errObj.code === 'DATABASE_COLD_START') {
      return NextResponse.json(
        {
          error: 'データベースが起動中です',
          detail: 'データベースがスリープ状態から復帰中です。数秒後に再度お試しください。',
          retryable: true,
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
