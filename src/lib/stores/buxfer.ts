import {
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
} from 'rxjs';
import type { TRPCClientInit } from 'trpc-sveltekit';
import { api, SvelteSubject, type Accounts, type Transactions } from '../utils';

const accounts = new SvelteSubject<Accounts>([]);
const transactions = new SvelteSubject<Transactions>([]);

export class Buxfer {
	private init: TRPCClientInit;

	constructor(init: TRPCClientInit) {
		this.init = init;
	}

	getAccounts(): Observable<Accounts> {
		return accounts.asObservable().pipe(
			switchMap(() => this.GetBuxferAccounts()),
			shareReplay()
		);
	}

	private GetBuxferAccounts(): Observable<Accounts> {
		return defer(async () => api(this.init).buxfer.accounts.query()).pipe(
			reduce((acc, curr) => acc.concat(curr)),
			catchError((error) => {
				// TODO - replace with logging collection data service (ex. Sentry).
				// eslint-disable-next-line no-console
				console.error(error);
				// return caught;
				return EMPTY;
			})
		);
	}

	getTransactions(dates: [start: Date, end: Date]): Observable<Transactions> {
		return transactions.asObservable().pipe(
			switchMap(() => this.GetBuxferTransactions(dates)),
			shareReplay()
		);
	}

	private GetBuxferTransactions(dates: [start: Date, end: Date]): Observable<Transactions> {
		const [start, end] = dates;
		const window = {
			start,
			end,
		};

		return defer(async () =>
			api(this.init).buxfer.transactions.query({
				window,
				page: 1,
			})
		).pipe(
			expand(({ totalTransactionsCount }, index) => {
				const last = Math.ceil(totalTransactionsCount / 100);

				if (index >= last - 1) {
					return EMPTY;
				}

				return api().buxfer.transactions.query({ window, page: last - index });
			}),
			toArray(),
			map((pages) => [...pages.slice(0, 1), ...pages.slice(1).reverse()]),
			concatAll(),
			map(({ transactions: transacts }) => transacts),
			reduce((acc, curr) => acc.concat(curr)),
			catchError((error) => {
				// TODO - replace with logging collection data service (ex. Sentry).
				// eslint-disable-next-line no-console
				console.error(error);
				// return caught;
				return EMPTY;
			})
		);
	}
}
