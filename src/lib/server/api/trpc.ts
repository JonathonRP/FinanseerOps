import {
	initTRPC,
	TRPCError,
	type inferRouterError,
	type inferRouterContext,
	type ProcedureType,
	type AnyRouter,
	type Dict,
} from '@trpc/server';
import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import type { Session } from '@auth/core/types';
import { Role } from '@prisma/client';

import type { TRPCResponse } from '@trpc/server/rpc';
import { resolveHTTPResponse, type ResponseMeta } from '@trpc/server/http';
import { transformer } from '../../api/transformer';
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

export const createContext = async (event: RequestEvent) => {
	const { session } = event.locals;
	return createInnerTRPCContext({ session });
};

const api = initTRPC.context<typeof createContext>().create({
	transformer,
});

export const { router } = api;

const loggerMw = api.middleware(async ({ path, type, next }) => {
	const start = Date.now();
	const result = await next();
	const ms = Date.now() - start;

	// TODO - replace with logging collection data service (ex. Sentry).
	logger.info(`${result.ok ? 'OK' : 'ERR'} ${type} ${path} - ${ms}ms`);

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

export function createSvelteApiHandler<Router extends AnyRouter>({
	// eslint-disable-next-line @typescript-eslint/no-shadow
	router,
	// eslint-disable-next-line @typescript-eslint/no-shadow
	createContext,
	responseMeta,
	onError,
}: {
	/**
	 * The tRPC router to use.
	 * @see https://trpc.io/docs/router
	 */
	router: Router;

	/**
	 * An async function that returns the tRPC context.
	 * @see https://trpc.io/docs/context
	 */
	createContext?: (event: RequestEvent) => Promise<inferRouterContext<Router>>;

	/**
	 * A function that returns the response meta.
	 * @see https://trpc.io/docs/caching#using-responsemeta-to-cache-responses
	 */
	responseMeta?: (opts: {
		data: TRPCResponse<unknown, inferRouterError<Router>>[];
		ctx?: inferRouterContext<Router>;
		paths?: string[];
		type: ProcedureType | 'unknown';
		errors: TRPCError[];
	}) => ResponseMeta;

	/**
	 * A function that is called when an error occurs.
	 * @see https://trpc.io/docs/error-handling#handling-errors
	 */
	onError?: (opts: {
		ctx?: inferRouterContext<Router>;
		error: TRPCError;
		path: string | undefined;
		input: unknown;
		req: Omit<RequestInit, 'body' | 'headers'> & { headers: Dict<string | string[]>; body: unknown };
		type: ProcedureType | 'unknown';
	}) => void;
}): RequestHandler {
	return async (event) => {
		const request = event.request as Request & {
			headers: Dict<string | string[]>;
		};

		const req = {
			method: request.method,
			headers: request.headers,
			query: event.url.searchParams,
			body: await request.text(),
		};

		const url = event.route.id?.split('/').slice(0, -1).join('/') ?? '/api/trpc';

		const httpResponse = await resolveHTTPResponse({
			router,
			req,
			path: event.url.pathname.substring(url.length + 1),
			createContext: async () => createContext?.(event),
			responseMeta,
			onError,
		});

		const { status, headers, body } = httpResponse as {
			status: number;
			headers: Record<string, string>;
			body: string;
		};

		return new Response(body, { status, headers });
	};
}
