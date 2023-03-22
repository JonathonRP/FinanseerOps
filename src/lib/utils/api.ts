import { type TRPCClientInit, createTRPCClient } from 'trpc-sveltekit';
import type { AppRouter } from '../server/api/root';
import { devalue } from './devalueTransformer';
// import { browser } from '$app/environment';

let browserClient: ReturnType<typeof createTRPCClient<AppRouter>>;

export function api(init?: TRPCClientInit) {
	if (typeof window === 'undefined')
		return createTRPCClient<AppRouter>({
			// init: init ? {url: init.url , fetch: (url, options) => init.fetch?.(url, {...options, credentials: 'include'}) || fetch(url, {...options, credentials: 'include'}) } : undefined,
			init,
			transformer: devalue,
		});

	if (!browserClient)
		browserClient = createTRPCClient<AppRouter>({
			transformer: devalue,
		});

	return browserClient;
}

export type { RouterInputs, RouterOutputs, Accounts, Transactions } from '../server/api/root';
