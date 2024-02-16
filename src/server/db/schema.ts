import type { AdapterAccount } from '@auth/sveltekit/adapters';
import { sql } from 'drizzle-orm';
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
	foreignKey,
} from 'drizzle-orm/mysql-core';
import { ulid } from 'ulid';

export const users = mysqlTable(
	'user',
	{
		id: char('id', { length: 36 }).primaryKey().notNull(),
		name: varchar('name', { length: 255 }),
		email: varchar('email', { length: 255 }),
		emailVerified: timestamp('emailVerified', { mode: 'date', fsp: 3 }).defaultNow(),
		image: varchar('image', { length: 255 }),
		widgetStyle: mysqlEnum('widgetStyle', ['simple', 'dense']).default('simple').notNull(),
		enableNotification: boolean('emailNotifications').default(false).notNull(),
		financeCheckReminderNotificationRate: mysqlEnum('emailNotificationRate', [
			'daily',
			'weekly',
			'bi-weekly',
			'monthly',
			'bi-monthly',
		])
			.default('monthly')
			.notNull(),
		transactionsNotificationRate: mysqlEnum('inappNotificationRate', [
			'immediately',
			'hourly',
			'daily',
			'weekly',
			'bi-weekly',
			'monthly',
			'bi-monthly',
		])
			.default('daily')
			.notNull(),
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
		userId: char('userId', { length: 36 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
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
		pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
		userIdIdx: index('Account_userId_idx').on(table.userId),
		familyIdIdx: index('Account_familyId_idx').on(table.familyId),
	})
);

export const sessions = mysqlTable(
	'session',
	{
		sessionToken: varchar('sessionToken', { length: 255 }).notNull().primaryKey(),
		userId: char('userId', { length: 36 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
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
		leaderId: char('leaderId', { length: 36 }).references(() => users.id),
	},
	(table) => ({
		accountReference: foreignKey({
			name: 'family_accountFK',
			columns: [table.provider, table.providerAccountId],
			foreignColumns: [accounts.provider, accounts.providerAccountId],
		}),
		leaderIdIdx: index('Family_leaderId_idx').on(table.leaderId),
		accountIdx: index('Family_account_idx').on(table.provider, table.providerAccountId),
	})
);

export const verificationTokens = mysqlTable(
	'verificationToken',
	{
		identifier: varchar('identifier', { length: 255 }).notNull(),
		token: varchar('token', { length: 255 }).notNull(),
		expires: timestamp('expires', { mode: 'date' }).notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.identifier, table.token] }),
	})
);

export const notifications = mysqlTable('notification', {
	id: char('id', { length: 36 })
		.notNull()
		.default(sql`(uuid())`)
		.$default(ulid)
		.primaryKey(),
	message: varchar('message', { length: 255 }),
	type: mysqlEnum('type', ['invite', 'account']),
	read: boolean('read').default(false).notNull(),
	recipient: char('recipient', { length: 36 })
		.notNull()
		.references(() => users.id),
	createdBy: char('createdBy', { length: 36 })
		.notNull()
		.references(() => users.id),
	createdOn: timestamp('createdOn', { mode: 'date' }).notNull().defaultNow(),
	updatedOn: timestamp('updatedOn', { mode: 'date' }).onUpdateNow(),
});
