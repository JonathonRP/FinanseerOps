import { Buxfer } from '$lib/stores/buxfer';
import { sub, startOfMonth } from 'date-fns';
import type { PageLoad } from './$types';

export const load = ((event) => ({
	accounts: new Buxfer(event).getAccounts(),
	transactions: new Buxfer(event).getTransactions([startOfMonth(sub(new Date(), { months: 1 })), new Date()]),
})) satisfies PageLoad;
