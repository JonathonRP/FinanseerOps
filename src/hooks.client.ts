// import * as Sentry from '@sentry/svelte';

import { api } from '$lib/api';
import { formatError } from '$/lib/utils/index.svelte';
import type { HandleClientError } from '@sveltejs/kit';
import { ulid } from 'ulid';

// Sentry.init({
/* ... */
// });

export const handleError = (async ({ error, event }) => {
	const errorId = ulid();
	// example integration with https://sentry.io/
	// Sentry.captureException(error, { event, errorId });

	// TODO - replace with logging collection data service (ex. Sentry).
	api.logger.error.query({
		issue: (error as Error)?.stack || (error as App.Error).message || 'Oops!',
		...{ event, errorId, error },
	});

	return formatError(error);
}) satisfies HandleClientError;
