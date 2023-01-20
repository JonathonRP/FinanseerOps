import { api, type Transactions } from '../utils';
import { expand, EMPTY, defer, Observable, reduce, catchError, tap, BehaviorSubject, mergeWith, toArray, map, concatMap, concatAll } from 'rxjs';
import { page } from '$app/stores';
import { get } from 'svelte/store';

const transactions = new BehaviorSubject<Transactions>({numTransactions: 0, transactions: []}); 

export const getTransactions: Observable<Transactions> = transactions.pipe(
    mergeWith(
        GetBuxferTransactions(1).pipe(
            expand(({numTransactions}, index) => {
                const lastPage = (numTransactions / 100);

                if (index === lastPage - 1) {
                    return EMPTY
                }

                return GetBuxferTransactions(lastPage - index);
            }),
            toArray(),
            map(pages => [...pages.slice(0,1), ...pages.slice(1).reverse()]),
            concatAll(),
            reduce((acc, curr) => ({numTransactions: acc.numTransactions, transactions: acc.transactions.concat(curr.transactions)})),
        )
    )
);

function GetBuxferTransactions(pageCount: number): Observable<Transactions> {
    return defer(() => api(get(page)).buxfer_account.transactions.query({ 
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-12-31'),
        page: pageCount
    })).pipe(
        tap(console.log),
        catchError((error, caught) => {
            console.log(error);
            return caught;
        })
    );
}