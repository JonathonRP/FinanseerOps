import { page } from '$app/stores';
import { derived, writable } from 'svelte/store';

const external = derived(page, ($page) => $page.data.locale || undefined);

const internal = writable<string>();

export const locale = derived([internal, external], ([$internal, $external]) => $internal || $external);
