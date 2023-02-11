import {page as pageStore} from '$app/stores';
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
import {get} from 'svelte/store';
import {api, SvelteSubject, type Transactions} from '../utils';

const transactions = new SvelteSubject<Transactions['transactions']>([]);

export function getTransactions(dates: [start: Date, end: Date]): Observable<Transactions['transactions']> {
  return transactions.asObservable().pipe(
    switchMap(() =>
      GetBuxferTransactions(dates, 1).pipe(
        expand(({numTransactions}, index) => {
          const last = Math.ceil(Number(numTransactions) / 100);

          if (index >= last - 1) {
            transactions.complete();
            return EMPTY;
          }

          return GetBuxferTransactions(dates, last - index);
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

function GetBuxferTransactions(dates: [start: Date, end: Date], page: number): Observable<Transactions> {
  const [start, end] = dates;

  return defer(() =>
    api(get(pageStore)).buxfer_account.transactions.query({
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
