import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma, ensureConnection } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sanitizeContent, hasDangerousContent } from '@/lib/sanitize';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ page: string }> }) {
  try {
    await ensureConnection();
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

    await ensureConnection();
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

    // Sanitize entries to prevent XSS
    const sanitizedEntries: [string, string][] = entries.map(([key, value]) => {
      const stringValue = String(value);
      if (hasDangerousContent(stringValue)) {
        console.warn(`Dangerous content detected in page "${page}", key "${key}". Content has been sanitized.`);
      }
      return [key, sanitizeContent(stringValue)];
    });

    // Helper function to save a single entry with retry
    const saveEntry = async (key: string, value: string, retries = 3): Promise<void> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          await prisma.content.upsert({
            where: { page_key: { page, key } },
            update: { value },
            create: { page, key, value },
          });
          return;
        } catch (err) {
          if (attempt === retries) throw err;
          await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)));
        }
      }
    };

    // Try interactive transaction first, fall back to individual upserts on connection error
    try {
      await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          for (const [key, value] of sanitizedEntries) {
            await tx.content.upsert({
              where: { page_key: { page, key } },
              update: { value },
              create: { page, key, value },
            });
          }
        },
        { timeout: 30000, maxWait: 10000 },
      );
      return NextResponse.json({ message: `${page}のコンテンツを保存しました` });
    } catch (txErr) {
      console.warn('Transaction save failed, retrying with individual upserts:', txErr);
    }

    // Fallback: save entries individually with retry
    for (const [key, value] of sanitizedEntries) {
      await saveEntry(key, value);
    }

    return NextResponse.json({ message: `${page}のコンテンツを保存しました` });
  } catch (err) {
    console.error('Update content error:', err);
    // Extract detailed error information for debugging
    let detail: string | undefined;
    let code: string | undefined;
    if (err instanceof Error) {
      detail = err.message;
      // Extract Prisma error code if available
      const prismaError = err as { code?: string };
      code = prismaError.code;
    } else if (typeof err === 'string') {
      detail = err;
    } else if (err && typeof err === 'object') {
      const errObj = err as { message?: string; code?: string };
      detail = errObj.message;
      code = errObj.code;
    }
    return NextResponse.json({ error: 'コンテンツの保存中にエラーが発生しました', detail, code }, { status: 500 });
  }
}
