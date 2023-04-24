// import * as Sentry from '@sentry/svelte';

import { api } from '$lib/api';

// Sentry.init({
/* ... */
// });

export async function handleError({ error, event }) {
	const errorId = crypto.randomUUID();
	// example integration with https://sentry.io/
	// Sentry.captureException(error, { event, errorId });

	// TODO - replace with logging collection data service (ex. Sentry).
	api.logger.error.query({ error, ...{ event, errorId } });

	return {
		code: errorId,
		message: (error as Error).message ?? 'Whoops!',
	};
}
