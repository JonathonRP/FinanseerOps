import type { AppRouter } from '$/server/api/root';
import {
	loggerLink,
	unstable_httpBatchStreamLink,
	createTRPCUntypedClient,
	type CreateTRPCClientOptions,
	type inferRouterProxyClient,
	createTRPCProxyClient,
} from '@trpc/client';
// import { Buxfer } from '$/server';
// import { addDays } from 'date-fns';
// import { refreshTokenLink } from './links/refreshLink';
import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared';
import type { AnyRouter, IntersectionError } from '@trpc/server';
import { transformer } from './transformer';
import { dev } from '$app/environment';

const provider = 'buxfer';

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

export type UntypedClientProperties =
	| '$request'
	| 'links'
	| 'mutation'
	| 'query'
	| 'requestAsPromise'
	| 'requestId'
	| 'runtime'
	| 'subscription';

/**
 * Creates a proxy client and shows type errors if you have query names that collide with built-in properties
 */
type CreateApiSvelteProxyClient<TRouter extends AnyRouter> =
	inferRouterProxyClient<TRouter> extends infer $ProcedureRecord
		? UntypedClientProperties & keyof $ProcedureRecord extends never
			? inferRouterProxyClient<TRouter>
			: IntersectionError<UntypedClientProperties & keyof $ProcedureRecord>
		: never;

const clientMethods = {
	query: [1, 'query'],
	mutation: [0, 'any'],
} as const;

type ClientMethod = keyof typeof clientMethods;

function createApiSvelteProxyClient<TRouter extends AnyRouter>(
	opts: CreateTRPCClientOptions<TRouter>
): CreateApiSvelteProxyClient<TRouter> {
	const client = createTRPCUntypedClient<TRouter>(opts);
	return createFlatProxy<CreateApiSvelteProxyClient<TRouter>>((key) => {
		if (client.hasOwnProperty(key)) {
			return (client as any)[key as any];
		}
		return createRecursiveProxy(({ path, args: unknownArgs }) => {
			const method = path.pop()! as ClientMethod;
			const joinedPath = path.join('.');

			// Pull the query options out of the args - it's at a different index based on the method
			const methodData = clientMethods[method];
			const args = unknownArgs as any[];

			const [optionIndex] = methodData;
			const options = args[optionIndex];

			const input =
				// Mutation doesn't have input
				method === 'mutation' ? undefined : args[0];

			switch (method) {
				case 'query':
					return client.query(joinedPath, input, options);
				case 'mutation':
					return client.mutation(joinedPath, input, options);
				default:
					throw new TypeError(`trpc.${joinedPath}.${method} is not a function`);
			}
		});
	});
}

export type { AppRouter, Accounts, Transactions } from '$/server/api/root';
export { transformer };
