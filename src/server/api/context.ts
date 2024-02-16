import type { RequestEvent, Cookies } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

// LINK - $/server/db.ts
import { db } from '../db';

type CreateContextOptions = {
	locals: App.Locals;
	requestHeaders: Headers;
	cookies: Cookies;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
	const {locals, requestHeaders, cookies} = opts;
	const {session, user} = locals;
	return {
		db,
		session,
		user,
		accessToken: requestHeaders.get('Authorization') || undefined,
		refreshToken: cookies.get('refreshToken')
	}
};

export const createContext = (event: RequestEvent) => {
	const {
		cookies,
		request: { headers: requestHeaders },
		locals
	} = event;
	return createInnerTRPCContext({ locals, requestHeaders, cookies });
};

export type Context = inferAsyncReturnType<typeof createContext>;
