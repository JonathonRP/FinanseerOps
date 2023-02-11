import { PrismaClient } from '@prisma/client';

import { dev } from '$app/environment';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: dev ? ['query', 'error', 'warn'] : ['error'],
  });

if (!dev) {
  global.prisma = prisma;
}
