import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const result: {
    status: string;
    timestamp: string;
    database?: string;
    dbError?: string;
    dbUrl?: string;
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };

  // Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    result.database = 'connected';
  } catch (err) {
    result.database = 'error';
    result.dbError = err instanceof Error ? err.message : 'Unknown error';
    // Show partial DATABASE_URL for debugging (hide password)
    const dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl) {
      result.dbUrl = dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    } else {
      result.dbUrl = 'NOT SET';
    }
  }

  return NextResponse.json(result);
}
