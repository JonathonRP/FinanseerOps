import type { Session } from '@dependencies/types';
import { Role } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
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

const logger = api.middleware(async ({ path, type, next }) => {
	const start = Date.now();
	const result = await next();
	const ms = Date.now() - start;

	console.log(`${result.ok ? 'OK' : 'ERR'} ${type} ${path} - ${ms}ms`);

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

export const procedure = api.procedure.use(logger);
export const adminProcedure = api.procedure.use(enforceUserIsAdmin).use(logger);
export const { mergeRouters } = api;
