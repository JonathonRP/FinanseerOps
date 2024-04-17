import { pgTable, pgSchema, unique, pgEnum, uuid, text, timestamp, foreignKey, integer } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const keyStatus = pgEnum("key_status", ['default', 'valid', 'invalid', 'expired'])
export const keyType = pgEnum("key_type", ['aead-ietf', 'aead-det', 'hmacsha512', 'hmacsha256', 'auth', 'shorthash', 'generichash', 'kdf', 'secretbox', 'secretstream', 'stream_xchacha20'])
export const factorType = pgEnum("factor_type", ['totp', 'webauthn'])
export const factorStatus = pgEnum("factor_status", ['unverified', 'verified'])
export const aalLevel = pgEnum("aal_level", ['aal1', 'aal2', 'aal3'])
export const codeChallengeMethod = pgEnum("code_challenge_method", ['s256', 'plain'])
export const requestStatus = pgEnum("request_status", ['PENDING', 'SUCCESS', 'ERROR'])
export const widgetStyles = pgEnum("widget_styles", ['simple', 'dense'])
export const rates = pgEnum("rates", ['daily', 'weekly', 'bi-weekly', 'monthly', 'bi-monthy'])
export const notificationTypes = pgEnum("notification_types", ['invite', 'account'])

export const authjs = pgSchema("authjs");

export const users = authjs.table("users", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text("name"),
	email: text("email"),
	emailVerified: timestamp("emailVerified", { mode: 'string' }),
	image: text("image"),
},
(table) => {
	return {
		emailUnique: unique("email_unique").on(table.email),
	}
});

export const sessions = authjs.table("sessions", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	expires: timestamp("expires", { mode: 'string' }).notNull(),
	sessionToken: text("sessionToken").notNull(),
	userId: uuid("userId").references(() => users.id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		sessiontokenUnique: unique("sessiontoken_unique").on(table.sessionToken),
	}
});

export const accounts = authjs.table("accounts", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	type: text("type").notNull(),
	provider: text("provider").notNull(),
	providerAccountId: text("providerAccountId").notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	scope: text("scope"),
	idToken: text("id_token"),
	sessionState: text("session_state"),
	userId: uuid("userId").references(() => users.id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		providerUnique: unique("provider_unique").on(table.provider, table.providerAccountId),
	}
});

export const verificationTokens = authjs.table("verification_tokens", {
	identifier: text("identifier"),
	token: text("token").primaryKey().notNull(),
	expires: timestamp("expires", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		tokenIdentifierUnique: unique("token_identifier_unique").on(table.identifier, table.token),
	}
});