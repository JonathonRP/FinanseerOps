import { buxferLogin, buxferToken, buxferAccounts, buxferTransactions, client } from '$lib/Buxfer';
import { date, number, object } from 'zod';
import { procedure, router } from '../trpc';

export const buxferAccountRouter = router({
	login: procedure
		.input(buxferLogin)
		.output(buxferToken)
		.query(
			async ({ ctx, input }) => ctx.session?.user?.buxfer || client({ endpoint: 'api/login', init: { body: input } })
		),

	transactions: procedure
		.input(
			object({
				start: date(),
				end: date(),
				page: number(),
			})
		)
		.output(buxferTransactions)
		.query(async ({ ctx, input }) => {
			const startDate = input.start.toDateString();
			const endDate = input.end.toDateString();

			return client({
				endpoint: '/api/transactions',
				init: {
					body: {
						token: ctx.session?.user?.buxfer.token,
						...{
							...input,
							startDate,
							endDate,
						},
					},
				},
			});
		}),

	accounts: procedure
		.output(buxferAccounts)
		.query(async ({ ctx }) =>
			client({ endpoint: '/api/accounts', init: { body: { token: ctx.session?.user?.buxfer.token } } })
		),
});

export type BuxferAccountRouter = typeof buxferAccountRouter;
