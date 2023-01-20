import { api, type Balances } from '../utils';
import { defer, Observable, catchError, tap, BehaviorSubject, mergeWith } from 'rxjs';
import { page } from '$app/stores';
import { get } from 'svelte/store';

const balances = new BehaviorSubject<Balances>({accounts: []}); 

export const getBalances: Observable<Balances> = balances.pipe(
    mergeWith(GetBuxferBalances())
);

function GetBuxferBalances(): Observable<Balances> {
    return defer(() => api(get(page)).buxfer_account.balances.query()).pipe(
            tap(console.log),
            catchError((error, caught) => {
                console.log(error);
                return caught;
            }),
        )
}