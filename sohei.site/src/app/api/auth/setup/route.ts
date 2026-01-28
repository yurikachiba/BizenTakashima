import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma, ensureConnection } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    await ensureConnection();
    const existingAdmin = await prisma.admin.findFirst();
    if (existingAdmin) {
      return NextResponse.json({ error: '管理者は既に設定されています' }, { status: 400 });
    }

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'パスワードが必要です' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.admin.create({ data: { passwordHash } });

    return NextResponse.json({ message: '管理者を作成しました' });
  } catch (err) {
    console.error('Setup error:', err);
    const message =
      err instanceof Error && err.message.includes('connect') ? 'データベースに接続できません' : 'サーバーエラー';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
