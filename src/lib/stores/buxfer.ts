import { startOfMonth, sub } from 'date-fns';
import {
	of,
	catchError,
	concatAll,
	defer,
	EMPTY,
	expand,
	map,
	Observable,
	reduce,
	shareReplay,
	switchMap,
	toArray,
	// retry,
	// timer,
} from 'rxjs';
import { api, type Accounts, type Transactions } from '../api';
import { SvelteSubject } from '../utils';

const accounts = new SvelteSubject<Accounts>([]);
const transactions = new SvelteSubject<Transactions>([]);

const GetBuxferAccounts = (): Observable<Accounts> =>
	defer(async () => api.buxfer.accounts.query()).pipe(
		reduce((acc, curr) => acc.concat(curr)),
		catchError((error) => {
			// TODO - replace with logging collection data service (ex. Sentry).
			// eslint-disable-next-line no-console
			console.error('accounts', error);
			return of([]);
		})
	);

const GetBuxferTransactions = (dates: [start?: Date, end?: Date]): Observable<Transactions> => {
	const [start, end = new Date()] = dates;
	const window = {
		start: startOfMonth(sub(start || end, { months: 1 })),
		end: end || start,
	};

	return defer(async () =>
		api.buxfer.transactions.query({
			window,
			page: 1,
		})
	).pipe(
		expand(({ totalTransactionsCount }, index) => {
			const last = Math.ceil(totalTransactionsCount / 100);

			if (index >= last - 1) {
				return EMPTY;
			}

			return api.buxfer.transactions.query({ window, page: last - index });
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
		})
	);
};

export const Buxfer = {
	getAccounts(): Observable<Accounts> {
		return accounts.asObservable().pipe(
			switchMap(() => GetBuxferAccounts()),
			// retry({ delay: () => timer(300) }),
			shareReplay()
		);
	},
	getTransactions(dates: [start?: Date, end?: Date]): Observable<Transactions> {
		return transactions.asObservable().pipe(
			switchMap(() => GetBuxferTransactions(dates)),
			// retry({ delay: () => timer(300) }),
			shareReplay()
		);
	},
};
