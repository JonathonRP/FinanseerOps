import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCSvelte } from 'trpc-svelte-query';
import { refreshTokenLink } from '$/server/api/links/refreshLink';
import type { AppRouter } from '$/server/api/root';
import { db } from '$/server/db';
import { accounts } from '$/server/db/schema';
import { BuxferClient } from '$/server/buxfer';
import { sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { addDays } from 'date-fns';
import { transformer } from './transformer';
import { dev } from '$app/environment';
import { SECRET } from '$env/static/private';
import { decrypt } from '../utils/cryption';

const provider = 'buxfer';

/// NOTE - Token = email:secret (secret: encryptedPassword);

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
				const { email, secret } = jwt.verify(refresh_token, SECRET);

				const access = await BuxferClient('/login', { email, password: decrypt(secret) });
				return {
					access,
					refresh: jwt.sign(refresh_token, SECRET, { expiresIn: '120d' }),
				};
			},
			async onJwtPairFetched(payload) {
				/// NOTE - save to database and cookies
				const { email } = jwt.verify(payload.refresh, SECRET);

				await db
					.update(accounts)
					.set({
						access_token: payload.refresh,
						expires_at: Number(addDays(Date.now(), 1)),
					})
					.where(sql`${accounts.provider} = ${provider} AND ${accounts.providerAccountId} = ${email}`);

				// event.cookies.set('accessToken', token(), { expires: new Date(account?.expires_at) });
			},
		}),
		httpBatchLink({
			url: '/api/trpc',
			async headers(opts) {
				const { context } = opts.opList[0];
				return {
					'X-BuxferAuthorization': await db
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
