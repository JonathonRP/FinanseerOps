import {
	buxferLoginAccount,
	buxferTransactionsQuery,
	buxferToken,
	buxferAccounts,
	BuxferClient,
	buxferTransactions,
} from '$lib/Buxfer';
import { procedure, router } from '../trpc';

export const buxferRouter = router({
	login: procedure
		.input(buxferLoginAccount)
		.output(buxferToken)
		.query(async ({ ctx, input }) => Promise.resolve(ctx.buxferToken || BuxferClient.login(input))),

	accounts: procedure
		.output(buxferAccounts)
		.query(async ({ ctx }) => BuxferClient.accounts(ctx.buxferToken ?? <never>null)),

	transactions: procedure
		.input(buxferTransactionsQuery)
		.output(buxferTransactions)
		.query(async ({ ctx, input }) =>
			BuxferClient.transactions({
				token: ctx.buxferToken ?? <never>null,
				...input,
			})
		),
});

export type BuxferRouter = typeof buxferRouter;
