import { api, type Transactions } from '../utils';
import { expand, EMPTY, defer, Observable, reduce, catchError, tap, BehaviorSubject, mergeWith, toArray, map, concatMap, concatAll } from 'rxjs';
import { page } from '$app/stores';
import { get } from 'svelte/store';

const transactions = new BehaviorSubject<Transactions>({numTransactions: '0', transactions: []}); 

export function getTransactions(dates: [start: Date, end: Date]): Observable<Transactions> { 
    return transactions.pipe(
        mergeWith(
            GetBuxferTransactions(dates, 1).pipe(
                expand(({numTransactions}, index) => {
                    const lastPage = Math.floor((Number(numTransactions) / 100));

                    if (index === lastPage - 1) {
                        return EMPTY
                    }

                    return GetBuxferTransactions(dates, lastPage - index);
                }),
                toArray(),
                map(pages => [...pages.slice(0,1), ...pages.slice(1).reverse()]),
                concatAll(),
                reduce((acc, curr) => ({numTransactions: acc.numTransactions, transactions: acc.transactions.concat(curr.transactions)})),
            )
        )
    );
}

function GetBuxferTransactions(dates: [start: Date, end: Date], pageCount: number): Observable<Transactions> {
    const [start, end] = dates;

    return defer(() => api(get(page)).buxfer_account.transactions.query({ 
        start: start,
        end: end,
        page: pageCount
    })).pipe(
        tap(console.log),
        catchError((error, caught) => {
            console.log(error);
            return caught;
        })
    );
}