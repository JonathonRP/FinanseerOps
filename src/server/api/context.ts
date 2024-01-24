import type { Session } from '@auth/sveltekit';
import type { RequestEvent, Cookies } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

// LINK - $/server/db.ts
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

export const createContext = async (event: RequestEvent) => {
	const {
		cookies,
		request: { headers: requestHeaders },
		locals: { auth }
	} = event;
	return createInnerTRPCContext({ session: await auth(), requestHeaders, cookies });
};

export type Context = inferAsyncReturnType<typeof createContext>;
