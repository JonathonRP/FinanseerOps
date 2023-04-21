import { api } from '$lib/api';

export async function load(event) {
	return {
		session: event.locals.session,
		api: api.ssr(event),
	};
}
