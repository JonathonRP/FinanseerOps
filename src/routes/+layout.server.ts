import type { LayoutServerLoad } from './$types';

export const load = (async (event) => ({
	session: event.locals.session,
})) satisfies LayoutServerLoad;
