// import * as Sentry from '@sentry/svelte';
import { logger } from '$lib/utils/logger';
import type { HandleClientError } from '@sveltejs/kit';

// Sentry.init({
/* ... */
// });

export const handleError = (async ({ error, event }) => {
	const errorId = crypto.randomUUID();
	// example integration with https://sentry.io/
	// Sentry.captureException(error, { event, errorId });

	// TODO - replace with logging collection data service (ex. Sentry).
	logger.error((error as Error).message, error, { event, errorId });

	return {
		message: (error as Error).message ?? 'Whoops!',
		code: errorId ?? 'UNKNOWN',
	};
}) satisfies HandleClientError;
