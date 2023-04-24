import { dev } from '$app/environment';
import { PrismaClient } from '@prisma/client';
import { logger } from '$lib/server/logger';
import { DATABASE_URL } from '$env/static/private';

// NOTE - dominantly used in trpc create inner context
// LINK - ./api/trpc.ts

const logging = dev
	? [
			{
				emit: 'event',
				level: 'query',
			} as const,
			{
				emit: 'event',
				level: 'error',
			} as const,
			{
				emit: 'event',
				level: 'warn',
			} as const,
	  ]
	: [
			{
				emit: 'event',
				level: 'error',
			} as const,
	  ];

const prisma = new PrismaClient({
	datasources: {
		db: {
			url: DATABASE_URL,
		},
	},
	log: logging,
	errorFormat: 'minimal',
});

prisma.$on('query', (e) => {
	logger.debug(`Query: ${e.query}`);
	logger.debug(`Params: ${e.params}`);
	logger.debug(`Duration: ${e.duration}ms`);
});

prisma.$on('warn', (e) => {
	logger.warn(e.message);
	logger.warn(e.target);
});

prisma.$on('error', (e) => {
	// TODO - replace with logging collection data service (ex. Sentry) for prod.
	logger.error(e.message);
	logger.error(e.target);
});

export default prisma;
