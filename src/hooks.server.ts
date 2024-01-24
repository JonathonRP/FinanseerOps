import * as Sentry from '@sentry/sveltekit';
import Email from '@auth/sveltekit/providers/email';
import { SvelteKitAuth, type SvelteKitAuthConfig } from '@auth/sveltekit';
import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { formatError } from '$lib/utils/index.svelte';
import { sendVerificationRequest } from '$/server';
import { parseAcceptLanguage } from 'intl-parse-accept-language';
import { ulid } from 'ulid';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { userSettings } from '$/lib/stores/userSettings.svelte';
import { setupSidecar } from '@spotlightjs/spotlight/sidecar';
import { db } from './server/db';
import { EMAIL_FROM } from '$env/static/private';
import { dev } from '$app/environment';

Sentry.init({
    dsn: "https://997785fc8294fedf8043d05970029853@o4506588389900288.ingest.sentry.io/4506588421095424",
    tracesSampleRate: 1.0,
	spotlight: dev
})

function loginAndResume(url: URL, loginEndpoint: string, redirectReason?: string) {
	const { pathname, search } = url;
	return `${loginEndpoint}${pathname.slice(1, -1) ? `?redirectTo=${pathname.slice(1, -1)}${search}${redirectReason ? `&reason=${redirectReason}` : ''}` : ''}`;
}

function authorization() {
	return (async ({ event, resolve }) => {
		const { url, request: { headers }, route } = event;
		const session = await event.locals.auth();
		

		if (!session && !route.id?.includes('anonymous')) {
			console.log('redirect', route.id);
			return redirect(302, loginAndResume(url, '/auth'));
		}

		if (!headers.get('Authorization') && route.id?.includes('finanseer')) {
			return redirect(302, `/user/linkBuxferAccount${url.search.slice(1)}`)
		}

		// REVIEW - is this needed?
		// if (session && redirectTo) {
		// 	return redirect(302, `/${redirectTo.slice(1)}`);
		// }
		
		return resolve(event);
	}) satisfies Handle;
}

function authentication() {
	return (async (...args) => {
		const authOptions: SvelteKitAuthConfig = {
			adapter: DrizzleAdapter(db),
			session: {
				strategy: 'database',
				generateSessionToken: () => ulid(),
			},
			providers: [
				Email({
					type: 'email',
					from: EMAIL_FROM,
					sendVerificationRequest,
				}),
			],
			callbacks: {
				async session(context) {
					const { session, user } = 'user' in context ? context : {...context, user: { undefined }};
					return {
						...session,
						user: {
							...session.user,
							...user,
						},
					};
				},
			},
			trustHost: true,
		};

		return SvelteKitAuth(authOptions)(...args);
	}) satisfies Handle;
}

function setup() {
	return (async ({ event, resolve }) => {
		const { request: { headers } } = event;
		const locales = parseAcceptLanguage(headers.get('accept-language') || '');

		userSettings.locale = locales.length ? locales[0] : 'en-US';
		userSettings.timezone = headers.get('x-vercel-ip-timezone') ?? '';

		return resolve(event);
	}) satisfies Handle;
}

export const handle = sequence(Sentry.sentryHandle(), sequence(authentication(), authorization(), setup()));

export const handleError = Sentry.handleErrorWithSentry((async ({ error, event }) => 
	// const errorId = ulid();

	// TODO - replace with logging collection data service (ex. Sentry).
	// logger.error((error as Error)?.stack || (error as App.Error).message || 'Oops!', { event, errorId, error });

	 formatError(error)
) satisfies HandleServerError);

if (dev) {
	setupSidecar();
}