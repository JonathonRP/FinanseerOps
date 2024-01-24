import { createTRPCSvelteServer } from 'trpc-svelte-query/server';
import * as Sentry from '@sentry/sveltekit';
import { appRouter } from './root';
import { createContext } from './context';
import { dev } from '$app/environment';

export const apiServer = createTRPCSvelteServer({
	endpoint: '/api/trpc',
	router: appRouter,
	createContext,
	...(!dev && {
		onError: ({ type, path, req, error }) => {
			// TODO - replace with logging collection data service (ex. Sentry).
			// logger.error(
			// 	`Encountered error while trying to process ${JSON.stringify(req)}, ${type} @ ${path ?? '[no path]'}:`,
			// 	error.stack
			// );
			Sentry.captureException(new Error(`Encountered error while trying to process ${JSON.stringify(req, null, 2)}, ${type} @ ${path ?? '[no path]'}` ))
			throw error;
		},
	}),
});