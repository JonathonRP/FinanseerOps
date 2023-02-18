import { appRouter } from '$lib/server/api/root';
import { createContext } from '$lib/server/api/trpc';
import { prisma as db } from '$lib/server/db';
import { Email } from '@auth/core/providers/email';
import { SvelteKitAuth, type SvelteKitAuthConfig } from '@auth/sveltekit';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { createTRPCHandle } from 'trpc-sveltekit';
import { BUXFER_EMAIL as SERVER_USER, BUXFER_PASS, EMAIL_FROM, SERVER_PASS } from '$env/static/private';

export const authOptions: SvelteKitAuthConfig = {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	adapter: PrismaAdapter(db),
	// the session override fixes a weird bug in the adapter
	// src: https://github.com/nextauthjs/next-auth/issues/6076#issuecomment-1354087465
	session: {
		strategy: 'database',
		generateSessionToken: () => crypto.randomUUID(),
	},
	providers: [
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		Email({
			server: {
				service: 'gmail',
				auth: {
					user: SERVER_USER,
					pass: SERVER_PASS,
				},
			},
			from: EMAIL_FROM,
		}),
	],
	callbacks: {
		async jwt({ token, account }) {
			if (account) {
				token.buxfer = { token: account.access_token };
			}
			return token;
		},
		async session({ session, user, token }) {
			if (session.user) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				session.user.role = user.role;
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				session.user.isInvited = user.isInvited;
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				session.user.emailVerified = user.emailVerified;
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				session.user.buxfer = token.buxfer;
			}
			return session;
		},
		async signIn({ user }) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			if (user.isInvited) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const revertInvite = !user.isInvited;
				await db.user.update({
					where: {
						id: user.id,
					},
					data: {
						isInvited: revertInvite,
					},
				});
			}
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			return Boolean(user.emailVerified || user.isInvited);
		},
	},
};

const authorization = () =>
	(async ({ event, resolve }) => {
		const session = await event.locals.getSession();

		if (!session) {
			// eslint-disable-next-line
			throw redirect(303, '/auth/signin');
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (session.user && !session.user.buxfer) {
			const buxfer = await appRouter
				.createCaller(await createContext(event))
				.buxfer_account.login({ email: SERVER_USER, password: BUXFER_PASS });

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			session.user.buxfer = buxfer;
		}

		return resolve(event);
	}) satisfies Handle;

export const handle = sequence(
	SvelteKitAuth(authOptions),
	authorization(),
	createTRPCHandle({
		router: appRouter,
		createContext,
		onError: ({ type, path, error }) =>
			// eslint-disable-next-line
			console.error(`Encountered error while trying to process ${type} @ ${path}:`, error),
	})
);
