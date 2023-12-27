import type { AppRouter } from '$/server/api/root';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCSvelte } from 'trpc-svelte-query';
import { refreshTokenLink } from '$/server/api/links/refreshLink';
import { db } from '$/server/db';
import { accounts } from '$/server/db/schema';
import { BuxferClient } from '$/server/buxfer.svelte';
import { sql } from 'drizzle-orm';
import { addDays } from 'date-fns';
import { transformer } from './transformer';
import { dev } from '$app/environment';

const provider = 'buxfer';

export const api = createTRPCSvelte<AppRouter>({
	links: [
		loggerLink({
			enabled: (opts) => dev || (opts.direction === 'down' && opts.result instanceof Error),
		}),
		refreshTokenLink({
			getRefreshToken(ctx) {
				return ctx.refreshToken as string | undefined;
			},
			async fetchJwtPairByRefreshToken(refresh_token) {
				return BuxferClient('/refresh', { refresh: refresh_token });
			},
			async onJwtPairFetched({access, refresh}, email) {
				await db
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
				return {
					'Authorization': await db
						.select({ access_token: accounts.access_token })
						.from(accounts)
						.where(
							sql`${accounts.provider} = ${provider} AND (${accounts.userId} = ${context.user?.id} || ${accounts.familyId} = ${context.user?.familyId})`
						)
						.then((res) => res[0].access_token ?? undefined),
				};
			},
		}),
	],
	transformer,
});

export type { AppRouter } from '$/server/api/root';
export { transformer };
