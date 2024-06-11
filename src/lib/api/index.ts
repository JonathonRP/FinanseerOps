import type { AppRouter } from '$/server/api/root';
import { createTRPCProxyClient, loggerLink, unstable_httpBatchStreamLink } from '@trpc/client';
// import { Buxfer } from '$/server';
// import { addDays } from 'date-fns';
// import { refreshTokenLink } from './links/refreshLink';
import { dev } from '$app/environment';
import { transformer } from './transformer';

export const api = (url: { origin: string }) =>
	createTRPCProxyClient<AppRouter>({
		links: [
			loggerLink({
				enabled: (opts) => dev || (opts.direction === 'down' && opts.result instanceof Error),
			}),
			// refreshTokenLink({
			// 	async getRefreshToken(ctx) {
			// 		// return ctx.refreshToken as string | undefined;
			// 		await ctx.db
			// 			.update(accounts)
			// 			.set({ access_token: null })
			// 			.where(
			// 				sql`${accounts.provider} = ${provider} AND (${accounts.userId} = ${ctx.user?.id} || ${accounts.familyId} = ${ctx.user?.familyId})`
			// 			);
			// 		return undefined;
			// 	},
			// 	async fetchJwtPairByRefreshToken(refresh_token) {
			// 		// return Buxfer.client('/refresh', { refresh: refresh_token });
			// 		return Promise.resolve({
			// 			access: '',
			// 			refresh: '',
			// 		});
			// 	},
			// 	async onJwtPairFetched(ctx, { access, refresh }, email) {
			// 		await ctx.db
			// 			.update(accounts)
			// 			.set({
			// 				access_token: access,
			// 				refresh_token: refresh,
			// 				expires_at: Number(addDays(Date.now(), 1)),
			// 			})
			// 			.where(sql`${accounts.provider} = ${provider} AND ${accounts.providerAccountId} = ${email}`);
			// 	},
			// }),
			unstable_httpBatchStreamLink({
				url: url ? `${url.origin}/api/trpc` : '/api/trpc',
				maxURLLength: 2038,
			}),
		],
		transformer,
	});

export type { BankAccounts as Accounts, AppRouter, BankTransactions as Transactions } from '$/server/api/root';
export { transformer };
