import { page } from '$app/stores';
import type { Session } from '@auth/core/types';
import { derived, writable } from 'svelte/store';

const external = derived(page, ($page) => $page.data.session || undefined);

const internal = writable<Session>();

export const session = derived([internal, external], ([$internal, $external]) => $internal || $external);
