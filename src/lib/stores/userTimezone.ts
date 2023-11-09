import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';

const external = derived(page, ($page) => $page.data.timezone || undefined);

const internal = writable<string>();

export const timezone = derived([internal, external], ([$internal, $external]) => $internal || $external);
