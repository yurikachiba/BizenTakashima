import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Qh7A.(LDu%P-';

let seeded = false;

export async function ensureAdmin(): Promise<void> {
  if (seeded) return;

  const existing = await prisma.admin.findFirst();
  if (!existing) {
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
    await prisma.admin.create({ data: { passwordHash } });
    console.log('Default admin created via auto-seed');
  }

  seeded = true;
}
