import * as Sentry from '@sentry/sveltekit';

import type { HandleClientError } from '@sveltejs/kit';
import { formatError } from '$lib/utils/index.svelte';
import * as Spotlight from '@spotlightjs/spotlight';
import { dev } from '$app/environment';

// If you don't want to use Session Replay, remove the `Replay` integration, 
// `replaysSessionSampleRate` and `replaysOnErrorSampleRate` options.
Sentry.init({
    dsn: "https://997785fc8294fedf8043d05970029853@o4506588389900288.ingest.sentry.io/4506588421095424",
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [new Sentry.Replay()]
})

export const handleError = Sentry.handleErrorWithSentry((async ({ error, event }) => 
	// const errorId = ulid();

	// TODO - replace with logging collection data service (ex. Sentry).
	// logger.error({
	// 	issue: (error as Error)?.stack || (error as App.Error).message || 'Oops!',
	// 	...{ event, errorId, error },
	// });

	formatError(error)
) satisfies HandleClientError);

if (dev) {
  await Spotlight.init({
    injectImmediately: true,
  });
}