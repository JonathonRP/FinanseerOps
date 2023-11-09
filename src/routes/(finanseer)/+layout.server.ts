import { trpcServer } from '$lib/api/server';

export async function load(event) {
	await trpcServer.buxfer.accounts.ssr(event);
}
