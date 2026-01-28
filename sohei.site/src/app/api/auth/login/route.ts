import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD;
const FALLBACK_ADMIN_ID = 'env-admin';

if (!DEFAULT_ADMIN_PASSWORD) {
  console.warn('DEFAULT_ADMIN_PASSWORD environment variable is not set. Initial admin setup will fail until set.');
}

type DbLoginResult =
  | { ok: true; token: string }
  | { ok: false; reason: 'wrong_password' }
  | { ok: false; reason: 'db_error' };

async function tryDatabaseLogin(password: string): Promise<DbLoginResult> {
  try {
    const { prisma, ensureConnection } = await import('@/lib/prisma');

    await ensureConnection();
    let admin = await prisma.admin.findFirst();
    if (!admin) {
      if (!DEFAULT_ADMIN_PASSWORD) {
        throw new Error('DEFAULT_ADMIN_PASSWORD environment variable is required for initial admin setup');
      }
      const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
      admin = await prisma.admin.create({ data: { passwordHash } });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return { ok: false, reason: 'wrong_password' };
    }

    return { ok: true, token: signToken(admin.id) };
  } catch (err) {
    console.error('Database login failed, falling back to env auth:', err);
    return { ok: false, reason: 'db_error' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'パスワードが必要です' }, { status: 400 });
    }

    const result = await tryDatabaseLogin(password);

    if (result.ok) {
      return NextResponse.json({ token: result.token });
    }

    if (result.reason === 'wrong_password') {
      return NextResponse.json({ error: 'パスワードが正しくありません' }, { status: 401 });
    }

    // DB error — fallback to env-based auth (only if DEFAULT_ADMIN_PASSWORD is set)
    if (DEFAULT_ADMIN_PASSWORD && password === DEFAULT_ADMIN_PASSWORD) {
      const token = signToken(FALLBACK_ADMIN_ID);
      return NextResponse.json({ token });
    }

    return NextResponse.json({ error: 'パスワードが正しくありません' }, { status: 401 });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
