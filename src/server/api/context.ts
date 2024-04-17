import type { RequestEvent, Cookies } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

// LINK - $/server/db.ts
import { db } from '../db';

type CreateContextOptions = {
	locals: App.Locals;
	cookies: Cookies;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
	const { locals, cookies } = opts;
	const { session, user } = locals;
	return {
		db,
		session,
		user,
		accessToken: cookies.get('x-account_accessToken') || cookies.get('x-family_accessToken'),
		refreshToken: cookies.get('refreshToken'),
	};
};

export const createContext = (event: RequestEvent) => {
	const { cookies, locals } = event;
	return createInnerTRPCContext({ locals, cookies });
};

export type Context = inferAsyncReturnType<typeof createContext>;
