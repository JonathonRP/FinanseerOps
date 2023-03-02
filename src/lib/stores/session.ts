import { page } from '$app/stores';
import type { Session } from '@dependencies/types';
import { Observable, shareReplay } from 'rxjs';
import { derived, type Readable } from 'svelte/store';

const external = dedupe(derived(page, ($page) => $page.data?.session || undefined));

export const session: Observable<Session> = new Observable<Session>((obs) =>
	external.subscribe((val) => obs.next(val))
).pipe(shareReplay());

function dedupe<T>(store: Readable<T>): Readable<T> {
	let previous: T;

	return derived(store, ($value, set) => {
		if ($value !== previous) {
			previous = $value;
			set($value);
		}
	});
}
