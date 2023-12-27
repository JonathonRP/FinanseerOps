import type { AdapterAccount } from '@auth/core/adapters';
import {
	mysqlTable,
	uniqueIndex,
	index,
	char,
	varchar,
	text,
	boolean,
	timestamp,
	int,
	mysqlEnum,
	primaryKey,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable(
	'user',
	{
		id: char('id', { length: 36 }).primaryKey().notNull(),
		name: varchar('name', { length: 255 }),
		email: varchar('email', { length: 255 }),
		emailVerified: timestamp('emailVerified', { mode: 'date', fsp: 3 }).defaultNow(),
		image: varchar('image', { length: 255 }),
		widgetStyle: mysqlEnum('widgetStyle', ['simple', 'dense']).default('simple').notNull(),
		emailNotifications: boolean('emailNotifications').default(false).notNull(),
		leadershipId: char('leadershipId', { length: 36 }),
		familyId: char('familyId', { length: 36 }),
	},
	(table) => ({
		emailKey: uniqueIndex('User_email_key').on(table.email),
		idIdx: index('User_id_idx').on(table.id),
		emailIdx: index('User_email_idx').on(table.email),
		familyIdx: index('User_familyId_idx').on(table.familyId),
		leadershipIdx: index('User_leadershipId_idx').on(table.leadershipId),
	})
);

export const accounts = mysqlTable(
	'account',
	{
		userId: char('userId', { length: 36 }).notNull(),
		familyId: char('familyId', { length: 36 }),
		type: varchar('type', { length: 255 }).$type<AdapterAccount['type']>().notNull(),
		provider: varchar('provider', { length: 255 }).notNull(),
		providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
		refresh_token: text('refresh_token'),
		access_token: text('access_token'),
		expires_at: int('expires_at'),
		token_type: varchar('token_type', { length: 255 }),
		scope: varchar('scope', { length: 255 }),
		id_token: text('id_token'),
		session_state: varchar('session_state', { length: 255 }),
	},
	(table) => ({
		comboundKey: primaryKey(table.provider, table.providerAccountId),
		userIdIdx: index('Account_userId_idx').on(table.userId),
		familyIdIdx: index('Account_familyId_idx').on(table.familyId),
	})
);

export const sessions = mysqlTable(
	'session',
	{
		sessionToken: varchar('sessionToken', { length: 255 }).notNull().primaryKey(),
		userId: char('userId', { length: 36 }).notNull(),
		expires: timestamp('expires', { mode: 'date' }).notNull(),
	},
	(table) => ({
		userIdIdx: index('Session_userId_idx').on(table.userId),
	})
);

export const family = mysqlTable(
	'family',
	{
		id: char('id', { length: 36 }).notNull().primaryKey(),
		name: varchar('name', { length: 255 }),
		provider: varchar('provider', { length: 255 }),
		providerAccountId: varchar('providerAccountId', { length: 255 }),
		leaderId: char('leaderId', { length: 36 }),
	},
	(table) => ({
		leaderIdIdx: index('Family_leaderId_idx').on(table.leaderId),
		accountIdx: index('Family_account_idx').on(table.provider, table.providerAccountId),
	})
);

export const verificationTokens = mysqlTable(
	'verificationToken',
	{
		identifier: varchar('identifier', { length: 255 }).notNull(),
		token: varchar('token', { length: 255 }).primaryKey().notNull(),
		expires: timestamp('expires', { mode: 'date' }).notNull(),
	},
	(table) => ({
		compoundKey: primaryKey(table.identifier, table.token),
	})
);
