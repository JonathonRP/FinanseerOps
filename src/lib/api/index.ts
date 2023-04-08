import { dev } from '$app/environment';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCSvelte } from 'trpc-svelte-query';
import { ssrLink } from 'trpc-svelte-query/ssr';
import { transformer } from './transformer';
import type { AppRouter } from '../server/api';

// const baseUrl = () => (env.PUBLIC_VERCEL_URL ? `https://${env.PUBLIC_VERCEL_URL}` : 'http://localhost:5000');

// export const api = createTRPCProxyClient<AppRouter>({
// 	transformer,
// 	links: [
// 		loggerLink({
// 			enabled: (opts) => dev || (opts.direction === 'down' && opts.result instanceof Error),
// 		}),
// 		httpBatchLink({
// 			url: `${baseUrl()}/api/trpc`,
// 		}),
// 	],
// });

export const api = createTRPCSvelte<AppRouter>({
	links: [
		loggerLink({
			enabled: (opts) => dev || (opts.direction === 'down' && opts.result instanceof Error),
		}),
		ssrLink(httpBatchLink)({
			url: '/api/trpc',
		}),
	],
	transformer,
});

// export const {createClient, setContextClient, getContextClient} = createTRPCSvelte<AppRouter>()

export type { AppRouter, RouterInputs, RouterOutputs, Accounts, Transactions } from '../server/api';
export { transformer };
