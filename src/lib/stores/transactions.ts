import { appRouter } from '$lib/server/api/root';
import { createContext } from '$lib/server/api/trpc';
import type { RequestEvent } from '@sveltejs/kit';
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
import {SvelteSubject, type Transactions} from '../utils';

const transactions = new SvelteSubject<Transactions['transactions']>([]);

export function getTransactions(dates: [start: Date, end: Date], event: RequestEvent<Partial<Record<string, string>>, string | null>): Observable<Transactions['transactions']> {
  return transactions.asObservable().pipe(
    switchMap(() =>
      GetBuxferTransactions(dates, 1, event).pipe(
        expand(({numTransactions}, index) => {
          const last = Math.ceil(Number(numTransactions) / 100);

          if (index >= last - 1) {
            return EMPTY;
          }

          return GetBuxferTransactions(dates, last - index, event);
        }),
        toArray(),
        map(pages => [...pages.slice(0, 1), ...pages.slice(1).reverse()]),
        concatAll(),
        map(transactions => transactions.transactions),
        reduce((acc, curr) => acc.concat(curr))
      )
    ),
    shareReplay()
  );
}

function GetBuxferTransactions(dates: [start: Date, end: Date], page: number, event: RequestEvent<Partial<Record<string, string>>, string | null>): Observable<Transactions> {
  const [start, end] = dates;

  return defer(async () =>
    appRouter.createCaller(await createContext(event)).buxfer_account.transactions({
      start,
      end,
      page,
    })
  ).pipe(
    catchError((error, caught) => {
      console.log(error);
      return caught;
    })
  );
}
