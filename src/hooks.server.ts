import { appRouter } from '$lib/server/api/root';
import { createContext } from '$lib/server/api/trpc';
import db from '$lib/server/db';
import { Email } from '@auth/core/providers/email';
import { SvelteKitAuth, type SvelteKitAuthConfig } from '@auth/sveltekit';
import { redirect, type Handle, type HandleServerError, type RequestEvent } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { createTRPCHandle } from 'trpc-sveltekit';
import PrismaAdapter from '$lib/prisma/adapter';
import { BUXFER_EMAIL as SERVER_USER, BUXFER_PASS, EMAIL_FROM, SERVER_PASS } from '$env/static/private';

const authorization = () =>
	(async ({ event, resolve }) => {
		await event.locals.getSession();

		if (!event.locals.session && !event.route.id?.includes('anonymous')) {
			throw redirect(302, '/auth/signin');
		}

		return resolve(event);
	}) satisfies Handle;

const getBuxferToken = async (event: RequestEvent) =>
	appRouter.createCaller(await createContext(event)).buxferAccount.login({
		email: SERVER_USER,
		password: BUXFER_PASS,
	});

const authentication = () =>
	(async (...args) => {
		const [{ event }] = args;
		/* eslint @typescript-eslint/ban-ts-comment: 0 */
		const authOptions: SvelteKitAuthConfig = {
			adapter: PrismaAdapter(db),
			// the session override fixes a weird bug in the adapter
			// src: https://github.com/nextauthjs/next-auth/issues/6076#issuecomment-1354087465
			session: {
				strategy: 'database',
				generateSessionToken: () => crypto.randomUUID(),
			},
			providers: [
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
				async session({ session, user }) {
					if (session.user) {
						session.user = {
							...session.user,
							...user,
							buxferToken: user.account.access_token,
						};
					}
					event.locals.session = session;
					return session;
				},
				async signIn({ user, account }) {
					return Boolean((user.emailVerified || user.isInvited) && account);
				},
			},
			events: {
				async signIn(message) {
					if (!message.account?.access_token) {
						message.user.account.access_token = await getBuxferToken(event);
					}
				},
			},
		};

		return SvelteKitAuth(authOptions)(...args);
	}) satisfies Handle;

export const handle = sequence(
	authentication(),
	authorization(),
	createTRPCHandle({
		router: appRouter,
		createContext,
		onError: ({ type, path, error }) =>
			console.error(`Encountered error while trying to process ${type} @ ${path}:`, error),
	})
);

// import * as Sentry from '@sentry/node';

// Sentry.init({
/* ... */
// });

export const handleError = (async ({ error, event }) => {
	const errorId = crypto.randomUUID();
	// example integration with https://sentry.io/
	// Sentry.captureException(error, { event });
	console.log(error, { event, errorId });

	return {
		message: (error as Error).message ?? 'Whoops!',
		code: errorId ?? 'UNKNOWN',
	};
}) satisfies HandleServerError;
