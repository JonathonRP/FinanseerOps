import { switchMap, expand, EMPTY, concatMap, toArray, defer, Observable, reduce, catchError, tap, of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { BuxferAccounts } from '../utils';

const GetBuxferBalances = (page: number): Observable<BuxferAccounts> => 
    fromFetch('/api/accounts', 
        { method: 'POST', 
            body: JSON.stringify({ 
                page,
                startDate: '2022-01-01',
                endDate: '2022-12-31' 
            })
        }).pipe(
            switchMap(async (resp: Response) => (await resp.json() as BuxferAccounts)),
            catchError(error => of(error))
        );

export const balances = defer(() => 
    GetBuxferBalances(1)).pipe(
        reduce((acc, res) => acc.concat(res.acounts), new Array()),
        catchError(error => of(error))
        // concatMap(async (result) => result.transactions),
        // toArray()
    )