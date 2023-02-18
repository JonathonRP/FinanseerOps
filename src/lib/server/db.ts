import { dev } from '$app/environment';
import { PrismaClient } from '@prisma/client';
import { DATABASE_URL } from '$env/static/private';

declare global {
	// eslint-disable-next-line vars-on-top, no-var
	var prisma: PrismaClient | undefined;
}

export const prisma =
	global.prisma ||
	new PrismaClient({
		datasources: {
			db: {
				url: DATABASE_URL,
			},
		},
		log: dev ? ['query', 'error', 'warn'] : ['error'],
	});

if (!dev) {
	global.prisma = prisma;
}
