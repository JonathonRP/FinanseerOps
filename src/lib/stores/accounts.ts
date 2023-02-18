import { appRouter } from '$lib/server/api/root';
import { createContext } from '$lib/server/api/trpc';
import type { RequestEvent } from '@sveltejs/kit';
import { catchError, defer, map, Observable, reduce, shareReplay, switchMap } from 'rxjs';
import { SvelteSubject, type Accounts } from '../utils';

const accounts = new SvelteSubject<Accounts['accounts']>([]);

export function getAccounts(
	event: RequestEvent<Partial<Record<string, string>>, string | null>
): Observable<Accounts['accounts']> {
	return accounts.asObservable().pipe(
		switchMap(() =>
			GetBuxferBalances(event).pipe(
				map((accounts) => accounts.accounts),
				reduce((acc, curr) => acc.concat(curr))
			)
		),
		shareReplay()
	);
}

function GetBuxferBalances(event: RequestEvent<Partial<Record<string, string>>, string | null>): Observable<Accounts> {
	return defer(async () => appRouter.createCaller(await createContext(event)).buxfer_account.accounts()).pipe(
		catchError((error, caught) => {
			console.log(error);
			return caught;
		})
	);
}
