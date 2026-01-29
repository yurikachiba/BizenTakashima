import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Cache the Prisma client globally to prevent connection pool exhaustion in serverless environments
globalForPrisma.prisma = prisma;

// Helper to add timeout to any promise (for fast failure in serverless)
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Database timeout')), ms)),
  ]);
}

// Helper function to check if error is a connection error
function isConnectionError(err: unknown): boolean {
  const error = err as { code?: string; message?: string };
  return (
    error.code === 'P1001' || // Can't reach database server
    error.code === 'P1002' || // Timeout in opening connection
    error.code === 'P1008' || // Operations timed out
    error.code === 'P1017' || // Connection closed
    error.message?.includes('Connection') === true ||
    error.message?.includes('connect') === true ||
    error.message?.includes('ECONNREFUSED') === true ||
    error.message?.includes('ETIMEDOUT') === true ||
    error.message?.includes("Can't reach database server") === true
  );
}

// Check if database is in cold-start state (Render.com free tier specific)
function isDatabaseColdStart(err: unknown): boolean {
  const error = err as { code?: string; message?: string };
  return error.code === 'P1001' || error.message?.includes("Can't reach database server") === true;
}

// Helper function to ensure database connection with retry
// Uses a simple query to verify the connection is actually working (more reliable in serverless)
// Optimized for serverless environments with shorter timeouts (Vercel: 10-60s)
export async function ensureConnection(retries = 3): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Use a simple query to verify connection instead of just $connect
      // This is more reliable in serverless environments where connections may go stale
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch (err) {
      lastError = err;
      const isColdStart = isDatabaseColdStart(err);

      console.warn(
        `Database connection attempt ${attempt}/${retries} failed${isColdStart ? ' (database may be waking up)' : ''}:`,
        err,
      );

      if (attempt === retries) {
        // Throw a more descriptive error for cold-start scenarios
        if (isColdStart) {
          const coldStartError = new Error(
            'データベースに接続できません。データベースがスリープ状態から復帰中の可能性があります。数秒後に再度お試しください。',
          );
          (coldStartError as unknown as { code: string }).code = 'DATABASE_COLD_START';
          (coldStartError as unknown as { originalError: unknown }).originalError = err;
          throw coldStartError;
        }
        throw err;
      }

      // Try to disconnect stale connections before retry
      try {
        await prisma.$disconnect();
      } catch {
        // Ignore disconnect errors
      }

      // Shorter exponential backoff for serverless environments
      // 2s, 4s, 8s = total ~14 seconds max wait (fits within serverless timeouts)
      const baseDelay = 2000;
      await new Promise((resolve) => setTimeout(resolve, baseDelay * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError;
}

// Wrapper function to execute database operations with retry logic
// Uses explicit type parameter to preserve return types
export async function withRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await ensureConnection();
      const result = await operation();
      return result;
    } catch (err) {
      lastError = err;
      if (!isConnectionError(err) || attempt === retries) {
        throw err;
      }
      console.warn(`Database operation attempt ${attempt}/${retries} failed, retrying:`, err);
      // Longer delays to handle database wake-up: 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  throw lastError;
}
