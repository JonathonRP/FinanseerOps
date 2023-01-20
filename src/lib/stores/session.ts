import { type Readable, derived } from 'svelte/store';
import { page } from '$app/stores';
import { Observable, shareReplay } from "rxjs";

const external = dedupe(derived(page, ($page) => $page.data?.session || ''));

export const session: Observable<string> = new Observable<string>(obs => {
        return external.subscribe(val => obs.next(val))
    }).pipe(
        shareReplay()
    );

function dedupe<T>(store: Readable<T>): Readable<T> {
    let previous: T;

    return derived(store, ($value, set) => {
        if ($value !== previous) {
            previous = $value;
            set($value);
        }
    })
}