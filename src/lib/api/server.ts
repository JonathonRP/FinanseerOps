import { createTRPCSvelteServer } from 'trpc-svelte-query/server';
import { appRouter } from '$/server/api/root';
import { createContext } from '$/server/api/context';
import { logger } from '$/server/logger';
import { dev } from '$app/environment';

export const trpcServer = createTRPCSvelteServer({
	endpoint: '/api/trpc',
	router: appRouter,
	createContext,
	...(!dev && {
		onError: ({ type, path, req, error }) => {
			// TODO - replace with logging collection data service (ex. Sentry).
			logger.error(
				`Encountered error while trying to process ${JSON.stringify(req)}, ${type} @ ${path ?? '[no path]'}:`,
				error.stack
			);
			throw error;
		},
	}),
});
