// import * as Sentry from '@sentry/svelte';
import type { HandleClientError } from '@sveltejs/kit';

// Sentry.init({
/* ... */
// });

export const handleError = (async ({ error, event }) => {
	const errorId = crypto.randomUUID();
	// example integration with https://sentry.io/
	// Sentry.captureException(error, { event, errorId });
	console.log(error, { event, errorId });

	return {
		message: (error as Error).message ?? 'Whoops!',
		code: errorId ?? 'UNKNOWN',
	};
}) satisfies HandleClientError;
