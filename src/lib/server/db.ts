import { dev } from '$app/environment';
import { PrismaClient } from '@prisma/client';
import { DATABASE_URL } from '$env/static/private';

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
	console.log(`Query: ${e.query}`);
	console.log(`Params: ${e.params}`);
	console.log(`Duration: ${e.duration}ms`);
});

prisma.$on('warn', (e) => {
	console.log(e.message);
	console.log(e.target);
});

prisma.$on('error', (e) => {
	console.log(e.message);
	console.log(e.target);
});

export default prisma;
