import { SvelteKitAuth, type SvelteKitAuthConfig } from '@auth/sveltekit';
import Resend from '@auth/sveltekit/providers/resend';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { AuthorizationHeadersBearerTokenFrom } from '$lib/utils';
import { type PgTableFn, pgTable } from 'drizzle-orm/pg-core';
import { sendVerificationRequest } from './sendVerificationRequest';
import { EMAIL_FROM } from '$env/static/private';
import { db } from './db';
import * as schema from './db/schema';
import { createCallerFactory } from './api/trpc';
import { createContext } from './api/context';
import { appRouter } from './api/root';

export const { handle, signIn, signOut } = SvelteKitAuth(
	async (event) =>
		({
			adapter: DrizzleAdapter(db, ((name, columns, extraConfig) => {
				switch (name) {
					case 'user':
						return schema.authUsers;
					case 'account':
						return schema.accounts;
					case 'session':
						return schema.sessions;
					case 'verificationToken':
						return schema.verificationTokens;
					default:
						return pgTable(name, columns, extraConfig);
				}
			}) as PgTableFn<undefined>),
			// session: {
			// 	strategy: 'jwt',
			// },
			providers: [
				Resend({
					from: EMAIL_FROM,
					sendVerificationRequest,
				}),
			],
			callbacks: {
				// jwt({ token, user, account }) {
				// 	if (account?.access_token) {
				// 		event.setHeaders(AuthorizationHeadersBearerTokenFrom(account.access_token));
				// 	}
				// 	return token;
				// },
				async session({ session, user }) {
					event.locals.session = session;
					event.locals.user = {
						...user,
						...(await createCallerFactory(appRouter)(createContext(event)).user.retrieve({ id: user.id })),
					};
					return {
						...session,
					};
				},
			},
			trustHost: true,
		}) satisfies SvelteKitAuthConfig
);
