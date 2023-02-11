import {getAccounts} from '$lib/stores/accounts';
import {getTransactions} from '$lib/stores/transactions';
import {startOfMonth, sub} from 'date-fns';
import type {LayoutLoad} from './$types';

export const load = (async () => {
  const today = new Date();

  return {
    today,
    accounts: getAccounts(),
    transactions: getTransactions([startOfMonth(sub(today, {months: 1})), today]),
  };
}) satisfies LayoutLoad;
