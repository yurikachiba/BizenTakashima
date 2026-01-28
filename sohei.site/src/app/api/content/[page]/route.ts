import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { page } = await params;
    const data = await request.json();

    const operations = Object.entries(data).map(([key, value]) =>
      prisma.content.upsert({
        where: { page_key: { page, key } },
        update: { value: String(value) },
        create: { page, key, value: String(value) },
      })
    );

    await prisma.$transaction(operations);
    return NextResponse.json({ message: `${page}のコンテンツを保存しました` });
  } catch (err) {
    console.error('Update content error:', err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
