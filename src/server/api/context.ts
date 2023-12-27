import type { Session } from '@auth/core/types';
import type { RequestEvent, Cookies } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

// LINK - ../db.ts
import { db } from '../db';

type CreateContextOptions = {
	session: Session | null;
	requestHeaders: Headers;
	cookies: Cookies;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => ({
	db,
	session: opts.session,
	user: opts.session?.user,
	accessToken: opts.requestHeaders.get('Authorization') || undefined,
	refreshToken: opts.cookies.get('refreshToken'),
});

export const createContext = (event: RequestEvent) => {
	const {
		locals: { session },
		cookies,
		request: { headers: requestHeaders },
	} = event;
	return createInnerTRPCContext({ session, requestHeaders, cookies });
};

export type Context = inferAsyncReturnType<typeof createContext>;
