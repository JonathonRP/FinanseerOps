import { startOfMonth, sub } from 'date-fns';
import {
	of,
	catchError,
	concatAll,
	defer,
	EMPTY,
	expand,
	finalize,
	map,
	Observable,
	reduce,
	shareReplay,
	switchMap,
	toArray,
} from 'rxjs';
import type { TRPCClientInit } from 'trpc-sveltekit';
import { api, SvelteSubject, type Accounts, type Transactions } from '../utils';

const accounts = new SvelteSubject<Accounts>([]);
const transactions = new SvelteSubject<Transactions>([]);

export function Buxfer(init?: TRPCClientInit | undefined) {
	const GetBuxferAccounts = (): Observable<Accounts> =>
		defer(async () => api(init).buxfer.accounts.query()).pipe(
			reduce((acc, curr) => acc.concat(curr)),
			catchError((error) => {
				// TODO - replace with logging collection data service (ex. Sentry).
				// eslint-disable-next-line no-console
				console.error('accounts', error);
				return of([]);
			}),
			finalize(console.log)
		);

	const GetBuxferTransactions = (dates: [start?: Date, end?: Date]): Observable<Transactions> => {
		const [start, end = new Date()] = dates;
		const window = {
			start: startOfMonth(sub(start || end, { months: 1 })),
			end: end || start,
		};

		return defer(async () =>
			api(init).buxfer.transactions.query({
				window,
				page: 1,
			})
		).pipe(
			expand(({ totalTransactionsCount }, index) => {
				const last = Math.ceil(totalTransactionsCount / 100);

				if (index >= last - 1) {
					return EMPTY;
				}

				return api(init).buxfer.transactions.query({ window, page: last - index });
			}),
			toArray(),
			map((pages) => [...pages.slice(0, 1), ...pages.slice(1).reverse()]),
			concatAll(),
			map(({ transactions: transacts }) => transacts),
			reduce((acc, curr) => acc.concat(curr)),
			catchError((error) => {
				// TODO - replace with logging collection data service (ex. Sentry).
				// eslint-disable-next-line no-console
				console.error('transactions', error);
				return of([]);
			}),
			finalize(console.log)
		);
	};

	return {
		getAccounts(): Observable<Accounts> {
			return accounts.asObservable().pipe(
				switchMap(() => GetBuxferAccounts()),
				shareReplay()
			);
		},
		getTransactions(dates: [start?: Date, end?: Date]): Observable<Transactions> {
			return transactions.asObservable().pipe(
				switchMap(() => GetBuxferTransactions(dates)),
				shareReplay()
			);
		},
	};
}
