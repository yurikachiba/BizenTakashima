import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, signToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const result = requireAuth(request);
  if (result instanceof NextResponse) return result;
  const newToken = signToken(result);
  return NextResponse.json({ valid: true, token: newToken });
}
