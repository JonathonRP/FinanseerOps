import type { DefaultSession, Account } from '@auth/core/types';
import type { SvelteKitAuthConfig as OGSvelteKitAuthConfig } from '@auth/sveltekit';
import type { AdapterAccount, AdapterSession, VerificationToken } from '@auth/core/adapters';
import type { Users, Accounts } from '../src/server/db';

declare module '@auth/core/types' {
	export interface Session extends DefaultSession {
		user?: Users & DefaultSession['user'];
	}
	export interface Adapter {
		createUser?(user: Omit<AdapterUser, 'id'>): Awaitable<AdapterUser>;
		getUser?(id: string): Awaitable<AdapterUser | null>;
		getUserByEmail?(email: string): Awaitable<AdapterUser | null>;

		/** Using the provider id and the id of the user for a specific account, get the user. */
		getUserByAccount?(
			providerAccountId: Pick<AdapterAccount, 'provider' | 'providerAccountId'>
		): Awaitable<AdapterUser | null>;
		updateUser?(user: Partial<AdapterUser>): Awaitable<AdapterUser>;

		/** @todo This method is currently not invoked yet. */
		deleteUser?(userId: string): Promise<void> | Awaitable<AdapterUser | null | undefined>;

		/**
		 * This method is invoked internally (but optionally can be used for manual linking).
		 * It creates an [Account](https://authjs.dev/reference/adapters#models) in the database.
		 */
		linkAccount?(account: AdapterAccount): Promise<void> | Awaitable<AdapterAccount | null | undefined>;

		/** @todo This method is currently not invoked yet. */
		unlinkAccount?(
			providerAccountId: Pick<AdapterAccount, 'provider' | 'providerAccountId'>
		): Promise<void> | Awaitable<AdapterAccount | undefined>;

		/** Creates a session for the user and returns it. */
		createSession?(session: { sessionToken: string; userId: string; expires: Date }): Awaitable<AdapterSession>;
		getSessionAndUser?(sessionToken: string): Awaitable<{ session: AdapterSession; user: AdapterUser } | null>;
		updateSession?(
			session: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>
		): Awaitable<AdapterSession | null | undefined>;

		/**
		 * Deletes a session from the database. It is preferred that this method also
		 * returns the session that is being deleted for logging purposes.
		 */
		deleteSession?(sessionToken: string): Promise<void> | Awaitable<AdapterSession | null | undefined>;
		createVerificationToken?(verificationToken: VerificationToken): Awaitable<VerificationToken | null | undefined>;

		/**
		 * Return verification token from the database and delete it so it cannot be
		 * used again.
		 */
		useVerificationToken?(params: { identifier: string; token: string }): Awaitable<VerificationToken | null>;
	}
	type AdapterUser = Users;
}

declare module '@sveltejs/kit' {
	interface Redirect extends Error {
		status: 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308;
		location: string;
	}
}

declare module '@auth/sveltekit' {
	interface SvelteKitAuthConfig extends OGSvelteKitAuthConfig {
		adapter: Adapter;
	}
}
