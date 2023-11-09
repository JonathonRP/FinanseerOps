import { trpcServer } from '$lib/api/server';

export async function load(event) {
	return {
		...event.locals,
		api: trpcServer.hydrateToClient(event),
	};
}
