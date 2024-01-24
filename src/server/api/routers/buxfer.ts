import {
	login,
	transactionsWindow,
	token,
	accounts,
	client,
	transactions,
} from '../../buxfer.svelte';
import { procedure, router } from '../trpc';

export const buxferRouter = router({
	login: procedure
		.input(login)
		.output(token)
		.query(async ({ input }) => client('/login', input)),

	accounts: procedure
		.output(accounts)
		.query(async ({ ctx, input }) => {
			const headers = new Headers();
			if (ctx && ctx.accessToken) {
				headers.append('Authorization', ctx.accessToken);
			}
			return client('/accounts', input, { headers });
		}),

	transactions: procedure
		.input(transactionsWindow)
		.output(transactions)
		.query(async ({ ctx, input }) => {
			const headers = new Headers();
			if (ctx && ctx.accessToken) {
				headers.append('Authorization', ctx.accessToken);
			}
			return client('/transactions', input, {
				headers,
			});
		}),
});

export type BuxferRouter = typeof buxferRouter;
