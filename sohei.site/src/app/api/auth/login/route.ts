import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Qh7A.(LDu%P-';
const FALLBACK_ADMIN_ID = 'env-admin';

type DbLoginResult =
  | { ok: true; token: string }
  | { ok: false; reason: 'wrong_password' }
  | { ok: false; reason: 'db_error' };

async function tryDatabaseLogin(password: string): Promise<DbLoginResult> {
  try {
    const { prisma } = await import('@/lib/prisma');

    let admin = await prisma.admin.findFirst();
    if (!admin) {
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

    // DB error — fallback to env-based auth
    if (password === DEFAULT_ADMIN_PASSWORD) {
      const token = signToken(FALLBACK_ADMIN_ID);
      return NextResponse.json({ token });
    }

    return NextResponse.json({ error: 'パスワードが正しくありません' }, { status: 401 });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
