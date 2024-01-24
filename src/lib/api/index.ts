import type { AppRouter } from '$/server/api/root';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCSvelte } from 'trpc-svelte-query';
import { accounts } from '$/server/db/schema';
// import { Buxfer } from '$/server';
import { sql } from 'drizzle-orm';
import { addDays } from 'date-fns';
import { refreshTokenLink } from './links/refreshLink';
import { transformer } from './transformer';
import { dev } from '$app/environment';

const provider = 'buxfer';

export const api = createTRPCSvelte<AppRouter>({
	links: [
		loggerLink({
			enabled: (opts) => dev || (opts.direction === 'down' && opts.result instanceof Error),
		}),
		refreshTokenLink({
			async getRefreshToken(ctx) {
				// return ctx.refreshToken as string | undefined;
				await ctx.db
					.update(accounts)
					.set({access_token: null})
					.where(
						sql`${accounts.provider} = ${provider} AND (${accounts.userId} = ${ctx.user?.id} || ${accounts.familyId} = ${ctx.user?.familyId})`
					)
				return undefined;
			},
			async fetchJwtPairByRefreshToken(refresh_token) {
				// return Buxfer.client('/refresh', { refresh: refresh_token });
				return Promise.resolve({
					access: '',
					refresh: ''
				});
			},
			async onJwtPairFetched(ctx, {access, refresh}, email) {
				await ctx.db
					.update(accounts)
					.set({
						access_token: access,
						refresh_token: refresh,
						expires_at: Number(addDays(Date.now(), 1)),
					})
					.where(sql`${accounts.provider} = ${provider} AND ${accounts.providerAccountId} = ${email}`);
			},
		}),
		httpBatchLink({
			url: '/api/trpc',
			async headers(opts) {
				const { context } = opts.opList[0];
				const auth = await context.db
						.select({ access_token: accounts.access_token })
						.from(accounts)
						.where(
							sql`${accounts.provider} = ${provider} AND (${accounts.userId} = ${context.user?.id} || ${accounts.familyId} = ${context.user?.familyId})`
						)
						.then((res) => res[0].access_token ?? undefined);
				return auth ? {'Authorization': auth} : {};
			},
		}),
	],
	transformer,
});

export type { AppRouter } from '$/server/api/root';
export { transformer };
