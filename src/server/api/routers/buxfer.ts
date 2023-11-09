import {
	buxferLogin,
	buxferTransactionsQuery,
	buxferToken,
	buxferAccounts,
	BuxferClient,
	buxferTransactions,
} from '../../buxfer';
import { procedure, router } from '../trpc';

export const buxferRouter = router({
	login: procedure
		.input(buxferLogin)
		.output(buxferToken)
		.query(async ({ input }) => BuxferClient('/login', input)),

	accounts: procedure
		.output(buxferAccounts)
		.query(async ({ ctx, input }) => {
			const headers = new Headers();
			headers.append('Authorization', ctx.accessToken);
			return BuxferClient('/accounts', input, { headers });
		}),

	transactions: procedure
		.input(buxferTransactionsQuery)
		.output(buxferTransactions)
		.query(async ({ ctx, input }) => {
			const headers = new Headers();
			headers.append('Authorization', ctx.accessToken);
			return BuxferClient('/transactions', input, {
				headers,
			});
		}),
});

export type BuxferRouter = typeof buxferRouter;
