import { initTRPC, TRPCError } from '@trpc/server';

import { transformer } from '$lib/api/transformer';
import type { Context } from './context';

const api = initTRPC.context<Context>().create({
	transformer,
	errorFormatter({ shape }) {
		return shape;
	},
});

export const { router } = api;

// const loggerMw = api.middleware(async ({ path, type, next }) => {
// 	const start = Date.now();
// 	const result = await next();
// 	const ms = Date.now() - start;

// 	// TODO - replace with logging collection data service (ex. Sentry).
// 	console.info(`${result.ok ? 'OK' : 'ERR'} ${type} ${path} - ${ms}ms`);

// 	return result;
// });

const enforceUserIsFamilyLead = api.middleware(async ({ ctx, next }) => {
	if (!ctx.session || !ctx.user || !ctx.user.leadershipId) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}
	return next({
		ctx: {
			session: { ...ctx.session, user: ctx.session.user },
		},
	});
});

export const { procedure } = api;
export const familyLeaderProcedure = api.procedure.use(enforceUserIsFamilyLead);
export const { mergeRouters } = api;
