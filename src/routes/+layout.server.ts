import {getAccounts} from '$lib/stores/accounts';
import {getTransactions} from '$lib/stores/transactions';
import {startOfMonth, sub} from 'date-fns';
import { lastValueFrom, take } from 'rxjs';
import type {LayoutServerLoad} from './$types';

export const load = (async (event) => {
  const today = new Date();

  return {
    today,
    accounts: await lastValueFrom(getAccounts(event).pipe(take(1))),
    transactions: await lastValueFrom(getTransactions([startOfMonth(sub(today, {months: 1})), today], event).pipe(take(1))),
  };
}) satisfies LayoutServerLoad;
