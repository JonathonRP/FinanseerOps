import type { inferProcedureOutput, inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { type TRPCClientInit, createTRPCClient } from 'trpc-sveltekit';
import type { AppRouter } from '$lib/server/api/root';
import superjson from 'superjson';
// import { browser } from '$app/environment';

let browserClient: ReturnType<typeof createTRPCClient<AppRouter>>;

export function api(init?: TRPCClientInit) {
	if (typeof window === 'undefined')
		return createTRPCClient<AppRouter>({
			// init: init ? {url: init.url , fetch: (url, options) => init.fetch?.(url, {...options, credentials: 'include'}) || fetch(url, {...options, credentials: 'include'}) } : undefined,
			init,
			transformer: superjson,
		});

	if (!browserClient)
		browserClient = createTRPCClient<AppRouter>({
			transformer: superjson,
		});

	return browserClient;
}

// 👇 type helpers 💡
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type Transactions = inferProcedureOutput<AppRouter['buxferAccount']['transactions']>;
export type Accounts = inferProcedureOutput<AppRouter['buxferAccount']['accounts']>;
