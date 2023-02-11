import {page} from '$app/stores';
import {catchError, defer, map, Observable, shareReplay, switchMap} from 'rxjs';
import {get} from 'svelte/store';
import {api, SvelteSubject, type Accounts} from '../utils';

const accounts = new SvelteSubject<Accounts['accounts']>([]);

export function getAccounts(): Observable<Accounts['accounts']> {
  return accounts.asObservable().pipe(
    switchMap(() => GetBuxferBalances().pipe(map(accounts => accounts.accounts))),
    shareReplay()
  );
}

function GetBuxferBalances(): Observable<Accounts> {
  return defer(() => api(get(page)).buxfer_account.accounts.query()).pipe(
    catchError((error, caught) => {
      console.log(error);
      return caught;
    })
  );
}
