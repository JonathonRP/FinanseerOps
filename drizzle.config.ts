import type { Config } from 'drizzle-kit';

export default {
	schema: './src/server/db/schema.ts',
	out: './supabase/migrations',
	driver: 'pg',
	dbCredentials: {
		connectionString: process.env.POSTGRES_URL ?? '',
	},
	// schemaFilter: ['authjs'],
} satisfies Config;
