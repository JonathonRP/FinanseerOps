import type { BuxferTransactions } from '../utils';
import { switchMap, expand, EMPTY, concatMap, toArray, defer, Observable, reduce, catchError, tap, of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';  

const GetBuxferTransactions = (page: number): Observable<BuxferTransactions> => 
    fromFetch('/api/transactions', 
        { method: 'POST', 
            body: JSON.stringify({ 
                page,
                startDate: '2022-01-01',
                endDate: '2022-12-31' 
            })
        }).pipe(
            switchMap(async (resp: Response) => (await resp.json() as BuxferTransactions)),
            catchError(error => of(error))
        );

export const transactions = defer(() => 
    GetBuxferTransactions(1)).pipe(
        expand(({numTransactions, transactions}, index) => {
            if (index > (numTransactions / 100) || !transactions) {
                return EMPTY
            }

            return GetBuxferTransactions(index + 1);
        }),
        reduce((acc, res) => acc.concat(res.transactions), new Array()),
        catchError(error => of(error))
        // concatMap(async (result) => result.transactions),
        // toArray()
    )