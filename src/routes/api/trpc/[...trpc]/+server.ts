import { appRouter } from '$lib/server/api';
import { createSvelteApiHandler, createContext } from '$lib/server/api/trpc';
import { logger } from '$lib/server/logger';

const handle = createSvelteApiHandler({
	router: appRouter,
	createContext,
	onError: ({ type, path, req, error }) => {
		// TODO - replace with logging collection data service (ex. Sentry).
		logger.error(`Encountered error while trying to process ${JSON.stringify(req)}, ${type} @ ${path}:`, error);
	},
});

export const GET = handle;
export const POST = handle;
