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
          console.warn(`Save entry attempt ${attempt}/${retries} failed for key "${key}":`, err);
          if (attempt === retries) throw err;
          await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)));
        }
      }
    };

    // Try interactive transaction first, fall back to individual upserts on error
    // Use shorter timeout (8s) to fit within Vercel's function timeout
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
        { timeout: 8000, maxWait: 5000 },
      );
      return NextResponse.json({ message: `${page}のコンテンツを保存しました` });
    } catch (txErr) {
      const txError = txErr as { message?: string; code?: string };
      console.warn('Transaction save failed, retrying with individual upserts:', txError.message, txError.code);
    }

    // Fallback: save entries individually with retry
    try {
      for (const [key, value] of sanitizedEntries) {
        await saveEntry(key, value);
      }
    } catch (fallbackErr) {
      const fbError = fallbackErr as { message?: string; code?: string };
      console.error('Fallback save also failed:', fbError.message, fbError.code);
      throw fallbackErr;
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

    // Provide user-friendly message for database cold start
    if (code === 'DATABASE_COLD_START') {
      return NextResponse.json(
        {
          error: 'データベースが起動中です',
          detail: 'データベースがスリープ状態から復帰中です。10〜30秒後に再度保存をお試しください。',
          code,
          retryable: true,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: 'コンテンツの保存中にエラーが発生しました', detail, code }, { status: 500 });
  }
}
