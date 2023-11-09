import type { Adapter } from '@auth/core/types';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import type { DB } from '.';
import { ulid } from 'ulid';

export default function PlanetScaleAuthAdapter(
	db: DB,
	{ users, sessions, accounts, verificationTokens } = schema
): Adapter {
	return {
		createUser: async (data) => {
			const id = ulid();

			await db.insert(users).values({ ...data, id });

			return db
				.select()
				.from(users)
				.where(sql`${users.id} = ${id}`)
				.then((res) => res[0]);
		},
		getUser: async (data) =>
			db
				.select()
				.from(users)
				.where(sql`${users.id} = ${data}`)
				.then((res) => res[0]) ?? null,
		getUserByEmail: async (data) =>
			db
				.select()
				.from(users)
				.where(sql`${users.email} = ${data}`)
				.then((res) => res[0]) ?? null,
		createSession: async (data) => {
			await db.insert(sessions).values(data);

			return db
				.select()
				.from(sessions)
				.where(sql`${sessions.sessionToken} = ${data.sessionToken}`)
				.then((res) => res[0]);
		},
		getSessionAndUser: async (data) =>
			db
				.select({
					session: sessions,
					user: users,
				})
				.from(sessions)
				.where(sql`${sessions.sessionToken} = ${data}`)
				.innerJoin(users, sql`${users.id} = ${sessions.userId}`)
				.then((res) => res[0]) ?? null,
		updateUser: async (data) => {
			if (!data.id) {
				throw new Error('No user id.');
			}

			await db
				.update(users)
				.set(data)
				.where(sql`${users.id} = ${data.id}`);

			return db
				.select()
				.from(users)
				.where(sql`${users.id} = ${data.id}`)
				.then((res) => res[0]);
		},
		updateSession: async (data) => {
			await db
				.update(sessions)
				.set(data)
				.where(sql`${sessions.sessionToken} = ${data.sessionToken}`);

			return db
				.select()
				.from(sessions)
				.where(sql`${sessions.sessionToken} = ${data.sessionToken}`)
				.then((res) => res[0]);
		},
		linkAccount: async (account) => {
			await db
				.insert(accounts)
				.values(account)
				.then((res) => res.rows[0]);
		},
		getUserByAccount: async (account) => {
			const dbAccount = await db
				.select()
				.from(accounts)
				.where(
					sql`${accounts.providerAccountId} = ${account.providerAccountId} and ${accounts.provider} = ${account.provider}`
				)
				.leftJoin(users, sql`${accounts.userId} = ${users.id}`)
				.then((res) => res[0]);

			return dbAccount.users;
		},
		deleteSession: async (sessionToken) => {
			await db.delete(sessions).where(sql`${sessions.sessionToken} = ${sessionToken}`);
		},
		createVerificationToken: async (token) => {
			await db.insert(verificationTokens).values(token);

			return db
				.select()
				.from(verificationTokens)
				.where(sql`${verificationTokens.identifier} = ${token.identifier}`)
				.then((res) => res[0]);
		},
		useVerificationToken: async (token) => {
			try {
				const deletedToken =
					(await db
						.select()
						.from(verificationTokens)
						.where(
							sql`${verificationTokens.identifier} = ${token.identifier} and ${verificationTokens.token} = ${token.token}`
						)
						.then((res) => res[0])) ?? null;

				await db
					.delete(verificationTokens)
					.where(
						sql`${verificationTokens.identifier} = ${token.identifier} and ${verificationTokens.token} = ${token.token}`
					);

				return deletedToken;
			} catch (err) {
				throw new Error('No verification token found.');
			}
		},
		deleteUser: async (id) => {
			await Promise.all([
				db.delete(users).where(sql`${users.id} = ${id}`),
				db.delete(sessions).where(sql`${sessions.userId} = ${id}`),
				db.delete(accounts).where(sql`${accounts.userId} = ${id}`),
			]);

			return null;
		},
		unlinkAccount: async (account) => {
			await db
				.delete(accounts)
				.where(
					sql`${accounts.providerAccountId} = ${account.providerAccountId} and ${accounts.provider} = ${account.provider}`
				);

			return undefined;
		},
	};
}
