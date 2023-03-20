import { Buxfer } from '$lib/stores/buxfer';
import type { PageLoad } from './$types';

export const load = ((event) => ({
	accounts: new Buxfer(event).getAccounts(),
})) satisfies PageLoad;
