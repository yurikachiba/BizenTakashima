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

// Helper function to check if error is a connection error
function isConnectionError(err: unknown): boolean {
  const error = err as { code?: string; message?: string };
  return (
    error.code === 'P1001' ||
    error.code === 'P1002' ||
    error.code === 'P1008' ||
    error.code === 'P1017' ||
    error.message?.includes('Connection') === true ||
    error.message?.includes('connect') === true ||
    error.message?.includes('ECONNREFUSED') === true ||
    error.message?.includes('ETIMEDOUT') === true
  );
}

// Helper function to ensure database connection with retry
// Uses a simple query to verify the connection is actually working (more reliable in serverless)
// Render.com free tier databases sleep after 15 minutes and can take up to 30 seconds to wake up
export async function ensureConnection(retries = 5): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Use a simple query to verify connection instead of just $connect
      // This is more reliable in serverless environments where connections may go stale
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch (err) {
      console.warn(`Database connection attempt ${attempt}/${retries} failed:`, err);
      if (attempt === retries) throw err;

      // Try to disconnect stale connections before retry
      try {
        await prisma.$disconnect();
      } catch {
        // Ignore disconnect errors
      }

      // Exponential backoff with longer delays for database wake-up
      // Delays: 2s, 4s, 8s, 16s, 32s = total ~62 seconds max wait
      // This accommodates Render free tier database spin-up time (~30s)
      await new Promise((resolve) => setTimeout(resolve, 2000 * Math.pow(2, attempt - 1)));
    }
  }
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
