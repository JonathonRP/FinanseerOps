import Email from '@auth/core/providers/email';
import { SvelteKitAuth, type SvelteKitAuthConfig } from '@auth/sveltekit';
import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { formatError, sendVerificationRequest } from '$lib/utils';
import { parseAcceptLanguage } from 'intl-parse-accept-language';
import { ulid } from 'ulid';
import { logger } from './server/logger';
import { db } from './server/db';
import PlanetScaleAdapter from './server/db/auth-adapter';
import { EMAIL_FROM } from '$env/static/private';

function loginAndResume(url: URL, loginEndpoint: string, redirectReason?: string) {
	const { pathname, searchParams } = url;
	return `${loginEndpoint}?redirectTo=${pathname + searchParams}${redirectReason && `&reason=${redirectReason}`}`;
}

function authorization() {
	return (async ({ event, resolve }) => {
		const { url } = event;
		const redirectTo = url.searchParams.get('redirectTo');
		await event.locals.getSession();

		if (!event.locals.session && !event.route.id?.includes('anonymous')) {
			throw redirect(302, loginAndResume(url, '/auth/signin'));
		}

		if (event.locals.session && redirectTo) {
			throw redirect(302, `/${redirectTo.slice(1)}`);
		}

		return resolve(event);
	}) satisfies Handle;
}

function authentication() {
	return (async (...args) => {
		const [{ event }] = args;
		const authOptions: SvelteKitAuthConfig = {
			adapter: PlanetScaleAdapter(db),
			// the session override fixes a weird bug in the adapter
			// src: https://github.com/nextauthjs/next-auth/issues/6076#issuecomment-1354087465
			session: {
				strategy: 'database',
				generateSessionToken: () => ulid(),
			},
			providers: [
				Email({
					type: 'email',
					id: 'email',
					name: 'Email',
					from: EMAIL_FROM,
					sendVerificationRequest,
				}),
			],
			callbacks: {
				async session({ session, user }) {
					event.locals.session = {
						...session,
						user: {
							...session.user,
							...user,
						},
					};
					return event.locals.session;
				},
			},
			trustHost: true,
		};

		return SvelteKitAuth(authOptions)(...args);
	}) satisfies Handle;
}

function setup() {
	return (async ({ event, resolve }) => {
		const { locals, request } = event;
		const locales = parseAcceptLanguage(request.headers.get('accept-language') || '');
		locals.locale = locales.length ? locales[0] : 'en-US';
		locals.timezone = request.headers.get('x-vercel-ip-timezone') ?? '';

		return resolve(event);
	}) satisfies Handle;
}

export const handle = sequence(authentication(), authorization(), setup());

// import * as Sentry from '@sentry/node';

// Sentry.init({
/* ... */
// });

export const handleError = (async ({ error, event }) => {
	const errorId = ulid();
	// example integration with https://sentry.io/
	// Sentry.captureException(error, { event });

	// TODO - replace with logging collection data service (ex. Sentry).
	logger.error((error as Error)?.stack || (error as App.Error).message || 'Oops!', { event, errorId, error });

	return formatError(error);
}) satisfies HandleServerError;
