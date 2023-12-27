import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, primaryKey, char, varchar, text, int, timestamp, unique, mysqlEnum, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"


export const account = mysqlTable("account", {
	userId: char("userId", { length: 36 }).notNull(),
	familyId: char("familyId", { length: 36 }),
	type: varchar("type", { length: 255 }).notNull(),
	provider: varchar("provider", { length: 255 }).notNull(),
	providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: int("expires_at"),
	tokenType: varchar("token_type", { length: 255 }),
	scope: varchar("scope", { length: 255 }),
	idToken: text("id_token"),
	sessionState: varchar("session_state", { length: 255 }),
},
(table) => {
	return {
		accountUserIdIdx: index("Account_userId_idx").on(table.userId),
		accountFamilyIdIdx: index("Account_familyId_idx").on(table.familyId),
		accountProviderProviderAccountId: primaryKey(table.provider, table.providerAccountId),
	}
});

export const family = mysqlTable("family", {
	id: char("id", { length: 36 }).notNull(),
	name: varchar("name", { length: 255 }),
	provider: varchar("provider", { length: 255 }),
	providerAccountId: varchar("providerAccountId", { length: 255 }),
	leaderId: char("leaderId", { length: 36 }),
},
(table) => {
	return {
		familyLeaderIdIdx: index("Family_leaderId_idx").on(table.leaderId),
		familyAccountIdx: index("Family_account_idx").on(table.provider, table.providerAccountId),
		familyId: primaryKey(table.id),
	}
});

export const session = mysqlTable("session", {
	sessionToken: varchar("sessionToken", { length: 255 }).notNull(),
	userId: char("userId", { length: 36 }).notNull(),
	expires: timestamp("expires", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		sessionUserIdIdx: index("Session_userId_idx").on(table.userId),
		sessionSessionToken: primaryKey(table.sessionToken),
	}
});

export const user = mysqlTable("user", {
	id: char("id", { length: 36 }).notNull(),
	name: varchar("name", { length: 255 }),
	email: varchar("email", { length: 255 }),
	emailVerified: timestamp("emailVerified", { fsp: 3, mode: 'string' }).defaultNow(),
	image: varchar("image", { length: 255 }),
	widgetStyle: mysqlEnum("widgetStyle", ['simple','dense']).default('simple').notNull(),
	emailNotifications: tinyint("emailNotifications").default(0).notNull(),
	leadershipId: char("leadershipId", { length: 36 }),
	familyId: char("familyId", { length: 36 }),
},
(table) => {
	return {
		userIdIdx: index("User_id_idx").on(table.id),
		userEmailIdx: index("User_email_idx").on(table.email),
		userFamilyIdIdx: index("User_familyId_idx").on(table.familyId),
		userLeadershipIdIdx: index("User_leadershipId_idx").on(table.leadershipId),
		userId: primaryKey(table.id),
		userEmailKey: unique("User_email_key").on(table.email),
	}
});

export const verificationToken = mysqlTable("verificationToken", {
	identifier: varchar("identifier", { length: 255 }).notNull(),
	token: varchar("token", { length: 255 }).notNull(),
	expires: timestamp("expires", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		verificationTokenToken: primaryKey(table.token),
	}
});