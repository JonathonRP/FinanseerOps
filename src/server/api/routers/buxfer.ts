import { custom, z } from 'zod';
import { Observable } from 'rxjs';
import { AuthorizationHeadersBearerTokenFrom } from '$/lib/utils';
import { login, transactionsQueryParams, token, accounts, client, transactions } from '../../buxfer';
import { procedure, router } from '../trpc';

export const buxferRouter = router({
	login: procedure
		.input(login)
		.output(custom<Observable<z.infer<typeof token>>>())
		.query(({ input }) => client('/login', input)),

	accounts: procedure.output(custom<Observable<z.infer<typeof accounts>>>()).query(({ ctx, input }) => {
		const headers = new Headers();
		if (ctx && ctx.accessToken) {
			const auth = AuthorizationHeadersBearerTokenFrom(ctx.accessToken);
			headers.append(Object.keys(auth)[0], Object.values(auth)[0]);
		}
		return client('/accounts', input, { headers });
	}),

	transactions: procedure
		.input(transactionsQueryParams)
		.output(custom<Observable<z.infer<typeof transactions>>>())
		.query(({ ctx, input }) => {
			const headers = new Headers();
			if (ctx && ctx.accessToken) {
				const auth = AuthorizationHeadersBearerTokenFrom(ctx.accessToken);
				headers.append(...Object.entries(auth)[0]);
			}
			return client('/transactions', input, {
				headers,
				poll: true,
				interval: '1s',
			});
		}),
});

export type BuxferRouter = typeof buxferRouter;
