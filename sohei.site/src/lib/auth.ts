import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

interface TokenPayload {
  adminId: string;
}

export function signToken(adminId: string): string {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function getAdminIdFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    return decoded.adminId;
  } catch {
    return null;
  }
}

export function unauthorizedResponse(message = '認証が必要です'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'トークンが無効です'): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function requireAuth(request: NextRequest): string | NextResponse {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return unauthorizedResponse();
  }

  try {
    const decoded = verifyToken(token);
    return decoded.adminId;
  } catch {
    return forbiddenResponse();
  }
}
