import { apiServer } from '$/server/api';

export async function load(event) {
	return {
		...await event.parent(),
		api: apiServer.hydrateToClient(event),
	}
}
