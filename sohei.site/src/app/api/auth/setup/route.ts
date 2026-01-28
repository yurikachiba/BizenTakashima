import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
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
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
