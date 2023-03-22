import { Buxfer } from '$lib/stores/buxfer';
import type { PageLoad } from './$types';

export const load = (async (event) => ({
	accounts: Buxfer(event).getAccounts(),
})) satisfies PageLoad;
