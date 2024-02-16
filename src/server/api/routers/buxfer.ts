import { custom, z } from 'zod';
import { Observable } from 'rxjs';
import { login, transactionsWindow, token, accounts, client, transactions } from '../../buxfer';
import { procedure, router } from '../trpc';

export const buxferRouter = router({
	login: procedure
		.input(login)
		.output(custom<Observable<z.infer<typeof token>>>())
		.query(({ input }) => client('/login', input)),

	accounts: procedure.output(custom<Observable<z.infer<typeof accounts>>>()).query(({ ctx, input }) => {
		const headers = new Headers();
		if (ctx && ctx.accessToken) {
			headers.append('Authorization', ctx.accessToken);
		}
		return client('/accounts', input, { headers });
	}),

	transactions: procedure
		.input(transactionsWindow)
		.output(custom<Observable<z.infer<typeof transactions>>>())
		.query(({ ctx, input }) => {
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
