import type { RequestEvent } from '@sveltejs/kit';

import type { Session } from '@auth/core/types';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

type CreateContextOptions = {
	buxfer_session: string | undefined;
	session: Session | null;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => ({
	db: prisma,
	session: opts.session,
});

export const createContext = async (event: RequestEvent) => {
	const session = await event.locals.getSession();

	return createInnerTRPCContext({ session });
};

const api = initTRPC.context<typeof createContext>().create({
	transformer: superjson,
});

export const { router } = api;

const logger = api.middleware(async ({ path, type, next }) => {
	const start = Date.now();
	const result = await next();
	const ms = Date.now() - start;

	console.log(`${result.ok ? 'OK' : 'ERR'} ${type} ${path} - ${ms}ms`, result);

	return result;
});

const enforceUserIsAdmin = api.middleware(async ({ ctx, next }) => {
	if (!ctx.session || !ctx.session.user || !(ctx.session.user.role === 'admin')) {
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
