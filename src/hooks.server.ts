import * as Sentry from '@sentry/sveltekit';
import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { returnTo, formatError, ensureLoggedIn } from '$lib/utils';

import { setupSidecar } from '@spotlightjs/spotlight/sidecar';
import { auth as authjs } from './server';
import { dev } from '$app/environment';

Sentry.init({
	dsn: 'https://997785fc8294fedf8043d05970029853@o4506588389900288.ingest.sentry.io/4506588421095424',
	tracesSampleRate: 1.0,
	spotlight: dev,
});

function authorization() {
	return (async ({ event, resolve }) => {
		const {
			url,
			request: { headers },
			route,
			locals: { auth },
		} = event;

		if (!route.id?.includes('anonymous') && !(await auth())) {
			return redirect(302, ensureLoggedIn(url, 'you were not logged in.'));
		}

		if (!headers.get('Authorization') && route.id?.includes('finanseer')) {
			return redirect(302, returnTo(url, '/user/linkBuxferAccount', 'your Buxfer Account was not linked.'));
		}

		// REVIEW - is this needed?
		// if (session && redirectTo) {
		// 	return redirect(302, `/${redirectTo.slice(1)}`);
		// }

		return resolve(event);
	}) satisfies Handle;
}

function authentication() {
	return authjs.handle;
}

// function setup() {
// 	return (async ({ event, resolve }) => {
// 		const {
// 			request: { headers },
// 		} = event;

// 		event.locals.timezone = headers.get('x-vercel-ip-timezone') ?? '';

// 		return resolve(event);
// 	}) satisfies Handle;
// }

export const handle = sequence(Sentry.sentryHandle(), sequence(authentication(), authorization()));

export const handleError = Sentry.handleErrorWithSentry((async ({ error, event }) =>
	// const errorId = ulid();

	// TODO - replace with logging collection data service (ex. Sentry).
	// logger.error((error as Error)?.stack || (error as App.Error).message || 'Oops!', { event, errorId, error });

	formatError(error)) satisfies HandleServerError);

if (dev) {
	setupSidecar();
}
