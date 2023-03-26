import { dev } from '$app/environment';
import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import { transformer } from './transformer';
import type { AppRouter } from '../server/api';
import { env } from '$env/dynamic/public';

const baseUrl = () => (env.PUBLIC_VERCEL_URL ? `https://${env.PUBLIC_VERCEL_URL}` : `http://localhost:${5000}`);

export const api = createTRPCProxyClient<AppRouter>({
	transformer,
	links: [
		loggerLink({
			enabled: (opts) => dev || (opts.direction === 'down' && opts.result instanceof Error),
		}),
		httpBatchLink({
			url: `${baseUrl()}/api/trpc`,
		}),
	],
});

export type { AppRouter, RouterInputs, RouterOutputs, Accounts, Transactions } from '../server/api';
export { transformer };
