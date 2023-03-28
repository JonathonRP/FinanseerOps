import { Buxfer } from '$lib/stores/buxfer';

export function load() {
	return {
		accounts: Buxfer.getAccounts(),
	}
};
