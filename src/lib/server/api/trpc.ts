import type { RequestEvent } from '@sveltejs/kit';
import { BUXFER_EMAIL as email, BUXFER_PASS as password } from '$env/static/private';
import { getToken } from '$lib/Buxfer';

type CreateContextOptions = {
	buxfer_session: string | undefined
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
	return {
		// prisma - db
		buxfer_session: opts.buxfer_session
	}
}

export const createContext = async (event: RequestEvent) => {
	const { fetch, url, request  } = event;

	const buxfer_session = await getToken({fetch, url, request}, {email, password});

	return createInnerTRPCContext({buxfer_session})
}

import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

const api = initTRPC.context<typeof createContext>().create({
    transformer: superjson
});

export const router = api.router;

const logger = api.middleware(async ({ path, type, next }) => {
	const start = Date.now();
	const result = await next();
	const ms = Date.now() - start;

	console.log(`${result.ok ? 'OK' : 'ERR'} ${type} ${path} - ${ms}ms`, result);

	return result;
});

export const procedure = api.procedure.use(logger);
export const mergeRouters = api.mergeRouters;