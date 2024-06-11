import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import * as schema from './schema';
import { POSTGRES_URL } from '$env/static/private';

if (!POSTGRES_URL) {
	throw new Error('please supply url');
}

// create the connection
const connection = postgres(POSTGRES_URL, { prepare: false });

export const db = drizzle(connection, { schema });

export type DB = typeof db;
export type Users = InferInsertModel<typeof schema.users>;
export type Accounts = InferInsertModel<typeof schema.accounts>;
export type Notifications = InferSelectModel<typeof schema.notifications>;

export const user = createSelectSchema(schema.users);
export const buxferAccount = createInsertSchema(schema.buxferAccounts);
export const notification = createInsertSchema(schema.notifications);
