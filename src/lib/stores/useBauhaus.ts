import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const defaultValue = false;
const initialValue = browser ? Boolean(window.localStorage.getItem('useBauhaus')) ?? defaultValue : defaultValue;

const useBauhaus = writable<boolean>(initialValue);

useBauhaus.subscribe((value) => {
	if (browser) {
		window.localStorage.setItem('useBauhaus', String(value));
	}
});

export default useBauhaus;
