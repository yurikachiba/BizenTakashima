import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

type Params = { params: Promise<{ page: string; key: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { page, key } = await params;
    const image = await prisma.image.findUnique({
      where: { page_key: { page, key } },
    });

    if (!image) {
      // Also serve as list endpoint when key is not found
      const images = await prisma.image.findMany({
        where: { page },
        select: { key: true },
      });
      if (images.length > 0 || key === '_list') {
        return NextResponse.json({ keys: images.map((img: { key: string }) => img.key) });
      }
      return NextResponse.json({ error: '画像が見つかりません' }, { status: 404 });
    }

    const buffer = Buffer.from(image.data, 'base64');
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': image.mimeType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('Get image error:', err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { page, key } = await params;
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: '画像ファイルが必要です' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '画像ファイルのみアップロード可能です' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは5MB以下にしてください' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type;

    await prisma.image.upsert({
      where: { page_key: { page, key } },
      update: { data, mimeType },
      create: { page, key, data, mimeType },
    });

    return NextResponse.json({ message: '画像を保存しました' });
  } catch (err) {
    console.error('Upload image error:', err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { page, key } = await params;

    await prisma.image.delete({
      where: { page_key: { page, key } },
    });
    return NextResponse.json({ message: '画像を削除しました' });
  } catch (err) {
    const prismaError = err as { code?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: '画像が見つかりません' }, { status: 404 });
    }
    console.error('Delete image error:', err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
