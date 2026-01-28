import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const result = requireAuth(request);
  if (result instanceof NextResponse) return result;
  return NextResponse.json({ valid: true });
}
