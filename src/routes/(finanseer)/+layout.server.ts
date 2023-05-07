import { api } from '$lib/api';

export async function load(event) {
	await api.buxfer.accounts.ssr(event);
}
