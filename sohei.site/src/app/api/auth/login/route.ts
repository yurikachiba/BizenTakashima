import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { prisma, withTimeout } from '@/lib/prisma';

const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD;
const FALLBACK_ADMIN_ID = 'env-admin';
const DB_TIMEOUT_MS = 5000; // 5 second timeout for DB operations

if (!DEFAULT_ADMIN_PASSWORD) {
  console.warn('DEFAULT_ADMIN_PASSWORD environment variable is not set. Initial admin setup will fail until set.');
}

type DbLoginResult =
  | { ok: true; token: string }
  | { ok: false; reason: 'wrong_password' }
  | { ok: false; reason: 'db_error' };

async function tryDatabaseLogin(password: string): Promise<DbLoginResult> {
  try {
    // Use timeout to prevent long waits when DB is unavailable
    const admin = await withTimeout(prisma.admin.findFirst(), DB_TIMEOUT_MS);

    if (!admin) {
      if (!DEFAULT_ADMIN_PASSWORD) {
        throw new Error('DEFAULT_ADMIN_PASSWORD environment variable is required for initial admin setup');
      }
      const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
      const newAdmin = await withTimeout(prisma.admin.create({ data: { passwordHash } }), DB_TIMEOUT_MS);
      const token = signToken(newAdmin.id);
      return { ok: true, token };
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
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '不正なリクエスト形式です' }, { status: 400 });
  }

  try {
    const { password } = body;
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
