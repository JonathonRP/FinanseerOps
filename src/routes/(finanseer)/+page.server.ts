import { apiServer } from '$/server/api';

export async function load(event) {
	await apiServer.buxfer.accounts.ssr(event);
}