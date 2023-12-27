import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const defaultValue = false;
const initialValue = browser
	? Boolean(JSON.parse(window.localStorage.getItem('useBauhaus') ?? 'null')) ?? defaultValue
	: defaultValue;

const useBauhaus = writable<boolean>(initialValue);

useBauhaus.subscribe((value) => {
	if (browser) {
		window.localStorage.setItem('useBauhaus', String(value));
	}
});

export default useBauhaus;
