import { createTRPCHandle } from 'trpc-sveltekit';
import { appRouter } from '$lib/server/api/root';
import { createContext } from '$lib/server/api/trpc';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(
	createTRPCHandle({
		router: appRouter,
		createContext,
		onError: ({ type, path, error }) => {
			return console.error(`Encountered error while trying to process ${type} @ ${path}:`, error);
		}
	})	
);