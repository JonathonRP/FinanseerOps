import {
	buxferLoginAccount,
	buxferTransactionsQuery,
	buxferToken,
	buxferAccounts,
	BuxferClient,
	buxferTransactions,
} from '$lib/server/buxfer';
import { procedure, router } from '../trpc';

export const buxferRouter = router({
	login: procedure
		.input(buxferLoginAccount)
		.output(buxferToken)
		.query(async ({ ctx, input }) => BuxferClient(ctx.buxferToken).login(input)),

	accounts: procedure.output(buxferAccounts).query(async ({ ctx }) => BuxferClient(ctx.buxferToken).accounts()),

	transactions: procedure
		.input(buxferTransactionsQuery)
		.output(buxferTransactions)
		.query(async ({ ctx, input }) =>
			BuxferClient(ctx.buxferToken).transactions({
				...input,
			})
		),
});

export type BuxferRouter = typeof buxferRouter;
