// import * as Sentry from '@sentry/svelte';

// Sentry.init({
/* ... */
// });

export async function handleError({ error, event }) {
	const errorId = crypto.randomUUID();
	// example integration with https://sentry.io/
	// Sentry.captureException(error, { event, errorId });

	// TODO - replace with logging collection data service (ex. Sentry).
	// eslint-disable-next-line no-console
	console.error((error as Error).message, error, { event, errorId });

	return {
		message: (error as Error).message ?? 'Whoops!',
	};
}
