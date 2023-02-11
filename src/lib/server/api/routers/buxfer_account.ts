import { router, procedure } from '../trpc';
import { client, buxferTransactions, buxferAccounts } from '$lib/Buxfer';
import { object, number, date } from 'zod';

export const buxfer_accountRouter = router({

	transactions: procedure
	.input(object({
		start: date(),
		end: date(),
		page: number()
	}))
	.output(buxferTransactions).query(async ({ctx, input}) => {
		const startDate = input.start.toDateString();
		const endDate = input.end.toDateString();

		return (await client('/api/transactions', {body: {
			token: ctx.buxfer_session, 
			...{
				...input, 
				startDate, 
				endDate
			}
		}}));
	}),

	accounts: procedure
	.output(buxferAccounts).query(async ({ctx}) => {
		return (await client('/api/accounts', {body: {token: ctx.buxfer_session}}));
	})
});

export type BuxferAccountRouter = typeof buxfer_accountRouter;
