import {
	buxferLogin,
	buxferTransactionsQuery,
	buxferTokens,
	buxferAccounts,
	BuxferClient,
	buxferTransactions,
} from '../../buxfer.svelte';
import { procedure, router } from '../trpc';

export const buxferRouter = router({
	login: procedure
		.input(buxferLogin)
		.output(buxferTokens)
		.query(async ({ input }) => BuxferClient('/login', input)),

	accounts: procedure
		.output(buxferAccounts)
		.query(async ({ ctx, input }) => {
			const headers = new Headers();
			if (ctx && ctx.accessToken) {
				headers.append('Authorization', ctx.accessToken);
			}
			return BuxferClient('/accounts', input, { headers });
		}),

	transactions: procedure
		.input(buxferTransactionsQuery)
		.output(buxferTransactions)
		.query(async ({ ctx, input }) => {
			const headers = new Headers();
			if (ctx && ctx.accessToken) {
				headers.append('Authorization', ctx.accessToken);
			}
			return BuxferClient('/transactions', input, {
				headers,
			});
		}),
});

export type BuxferRouter = typeof buxferRouter;
