import { Buxfer } from '$lib/stores/buxfer';
import type { PageLoad } from './$types';

export const load = (() => ({
	accounts: Buxfer.getAccounts(),
})) satisfies PageLoad;
