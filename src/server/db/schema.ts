import {
	pgTable,
	pgEnum,
	uuid,
	text,
	boolean,
	timestamp,
	pgSchema,
	unique,
	type AnyPgColumn,
	varchar,
	integer,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import type { AdapterAccount } from '@auth/sveltekit/adapters';

export const keyStatus = pgEnum('key_status', ['default', 'valid', 'invalid', 'expired']);
export const keyType = pgEnum('key_type', [
	'aead-ietf',
	'aead-det',
	'hmacsha512',
	'hmacsha256',
	'auth',
	'shorthash',
	'generichash',
	'kdf',
	'secretbox',
	'secretstream',
	'stream_xchacha20',
]);
export const factorType = pgEnum('factor_type', ['totp', 'webauthn']);
export const factorStatus = pgEnum('factor_status', ['unverified', 'verified']);
export const aalLevel = pgEnum('aal_level', ['aal1', 'aal2', 'aal3']);
export const codeChallengeMethod = pgEnum('code_challenge_method', ['s256', 'plain']);
export const requestStatus = pgEnum('request_status', ['PENDING', 'SUCCESS', 'ERROR']);
export const widgetStyles = pgEnum('widget_styles', ['simple', 'dense']);
export const rates = pgEnum('rates', ['daily', 'weekly', 'bi-weekly', 'monthly', 'bi-monthly']);
export const notificationTypes = pgEnum('notification_types', ['invite', 'account']);

export const authjs = pgSchema('authjs');

// TODO: Add api-key storage table to api-keys schema.
export const apiKeys = pgSchema('api-keys');

export const buckets = apiKeys.table('buckets', {
	name: text('name').primaryKey().notNull(),
	tokens: integer('tokens').notNull(),
	updated: integer('updated').notNull()
});

export const keys = apiKeys.table('keys', {
	hash: text('hash').primaryKey().notNull(),
	user: uuid('user').references(() => users.id, { onDelete: 'cascade'}).notNull(),
	name: text('name').notNull(),
	description: text('description').notNull(),
	expires: timestamp('expires', { mode: 'date' }),
	permissions: text('permissions').array().notNull()
});

// TODO: Add waiting list table to public schema.
export const waitingList = pgTable('waitingList', {
	id: uuid('id')
		.default(sql`uuid_generate_v4()`)
		.primaryKey()
		.notNull(),
	email: text('email').notNull().unique(),
})

export const notifications = pgTable('notifications', {
	id: uuid('id')
		.default(sql`uuid_generate_v4()`)
		.primaryKey()
		.notNull(),
	message: text('message'),
	type: notificationTypes('type'),
	seen: boolean('seen').default(false),
	recipientId: uuid('recipient_id').references(() => users.id, { onDelete: 'cascade'  }),
	createdBy: uuid('created_by').references(() => users.id, { onDelete: 'cascade' }),
	createdOn: timestamp('created_on', { mode: 'string' }).defaultNow(),
});

export const authUsers = authjs.table(
	'users',
	{
		id: uuid('id')
			.default(sql`uuid_generate_v4()`)
			.primaryKey()
			.notNull(),
		name: text('name'),
		email: text('email'),
		emailVerified: timestamp('emailVerified', { mode: 'date' }),
		image: text('image'),
	},
	(table) => ({
		emailUnique: unique('email_unique').on(table.email),
	})
);

export const users = pgTable(
	'users',
	{
		id: uuid('id')
			.default(sql`uuid_generate_v4()`)
			.primaryKey()
			.notNull(),
		name: text('name'),
		email: text('email'),
		emailVerified: timestamp('emailVerified', { mode: 'date' }),
		image: text('image'),
		widgetStyle: widgetStyles('widget_style').default('simple'),
		enableNotifications: boolean('enable_notifications').default(false),
		emailRate: rates('email_rate').default('monthly'),
		inAppRate: rates('in-app_rate').default('daily'),
		permittedBankAccounts: integer('permitted_bank_accounts').array(),
		leadershipId: uuid('leadership_id').references((): AnyPgColumn => families.id),
		membershipId: uuid('membership_id').references((): AnyPgColumn => families.id),
	},
	(table) => ({
		emailUnique: unique('email_unique').on(table.email),
	})
);

export const families = pgTable('families', {
	id: uuid('id').defaultRandom().primaryKey().notNull(),
	name: varchar('name'),
	leaderId: uuid('leader_id').references((): AnyPgColumn => users.id),
	accountId: uuid('account_id').references((): AnyPgColumn => buxferAccounts.id),
});

export const buxferAccounts = pgTable(
	'buxfer_accounts',
	{
		id: uuid('id').defaultRandom().primaryKey().notNull(),
		userId: uuid('user_id').references(() => users.id),
		familyId: uuid('family_id').references((): AnyPgColumn => families.id),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
	},
	(table) => ({
		userUnique: unique('user_unique').on(table.userId),
	})
);

export const sessions = authjs.table(
	'sessions',
	{
		id: uuid('id')
			.default(sql`uuid_generate_v4()`)
			.primaryKey()
			.notNull(),
		expires: timestamp('expires', { mode: 'date' }).notNull(),
		sessionToken: text('sessionToken').notNull(),
		userId: uuid('userId').references(() => users.id, { onDelete: 'cascade' }),
	},
	(table) => ({
		sessiontokenUnique: unique('sessiontoken_unique').on(table.sessionToken),
	})
);

export const accounts = authjs.table(
	'accounts',
	{
		id: uuid('id')
			.default(sql`uuid_generate_v4()`)
			.primaryKey()
			.notNull(),
		type: text('type').$type<AdapterAccount['type']>().notNull(),
		provider: text('provider').notNull(),
		providerAccountId: text('providerAccountId').notNull(),
		refreshToken: text('refresh_token'),
		accessToken: text('access_token'),
		expiresAt: integer('expires_at'),
		scope: text('scope'),
		idToken: text('id_token'),
		sessionState: text('session_state'),
		userId: uuid('userId').references(() => users.id, { onDelete: 'cascade' }),
	},
	(table) => ({
		providerUnique: unique('provider_unique').on(table.provider, table.providerAccountId),
	})
);

export const verificationTokens = authjs.table(
	'verification_tokens',
	{
		identifier: text('identifier'),
		token: text('token').primaryKey().notNull(),
		expires: timestamp('expires', { mode: 'date' }).notNull(),
	},
	(table) => ({
		tokenIdentifierUnique: unique('token_identifier_unique').on(table.identifier, table.token),
	})
);
