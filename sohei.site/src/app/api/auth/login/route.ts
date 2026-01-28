import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { ensureAdmin } from '@/lib/seed';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'パスワードが必要です' }, { status: 400 });
    }

    await ensureAdmin();

    const admin = await prisma.admin.findFirst();
    if (!admin) {
      return NextResponse.json({ error: '管理者が設定されていません' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'パスワードが正しくありません' }, { status: 401 });
    }

    const token = signToken(admin.id);
    return NextResponse.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    const message =
      err instanceof Error && err.message.includes('connect')
        ? 'データベースに接続できません'
        : 'サーバーエラー';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
