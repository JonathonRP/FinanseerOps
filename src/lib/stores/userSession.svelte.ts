import { derived } from 'svelte/store';
import { page } from '$app/stores';

class User {
	private external = $state(undefined);

	private internal = $state<App.PageData | undefined>(undefined);

	session = $derived(this.internal?.session || this.external);

	constructor() {
		derived([page], ($page: {data: App.PageData}) => (this.internal = $page.data || undefined));
	}
}

export const { session } = new User();
