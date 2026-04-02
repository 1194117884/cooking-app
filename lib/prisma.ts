import { PrismaClient } from '@prisma/client';
import { validateEnvironment } from './env-validation';

// Validate environment variables before initializing Prisma
validateEnvironment();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
