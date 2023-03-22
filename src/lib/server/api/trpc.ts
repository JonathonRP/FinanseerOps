import type { Session } from '@auth/core/types';
import { Role } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';

import { initTRPC, TRPCError } from '@trpc/server';
// import { devalue } from '../../utils/devalueTransformer';
import superjson from 'superjson';
import { logger } from '../logger';

// LINK - ../db.ts
import db from '../db';

type CreateContextOptions = {
	session: Session | null;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => ({
	db,
	buxferToken: opts.session?.user?.buxferToken,
	session: opts.session,
});

export const createContext = async (event: RequestEvent) => createInnerTRPCContext({ session: event.locals.session });

const api = initTRPC.context<typeof createContext>().create({
	transformer: superjson,
	errorFormatter({ shape }) {
		return shape;
	},
});

export const { router } = api;

const loggerMw = api.middleware(async ({ path, type, next }) => {
	const start = Date.now();
	const result = await next();
	const ms = Date.now() - start;

	// TODO - replace with logging collection data service (ex. Sentry).
	logger.info(`${result.ok ? 'OK' : 'ERR'} ${type} ${path} - ${ms}ms`);
	logger.info(result);

	return result;
});

const enforceUserIsAdmin = api.middleware(async ({ ctx, next }) => {
	if (!ctx.session || !ctx.session.user || !(ctx.session.user.role === Role.admin)) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}
	return next({
		ctx: {
			session: { ...ctx.session, user: ctx.session.user },
		},
	});
});

export const procedure = api.procedure.use(loggerMw);
export const adminProcedure = api.procedure.use(enforceUserIsAdmin).use(loggerMw);
export const { mergeRouters } = api;
