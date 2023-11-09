import { drizzle } from 'drizzle-orm/planetscale-serverless';
import { connect } from '@planetscale/database';
import type { InferModel } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';
import * as schema from './schema';
import { DATABASE_URL } from '$env/static/private';

if (!DATABASE_URL) {
	throw new Error('please supply url');
}

// create the connection
const connection = connect({
	url: DATABASE_URL,
});

export const db = drizzle(connection, { schema });

export type DB = typeof db;
export type Users = InferModel<typeof schema.users, 'insert'>;
export type Accounts = InferModel<typeof schema.accounts, 'insert'>;

export const user = createSelectSchema(schema.users);
