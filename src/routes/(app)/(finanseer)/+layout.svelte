<script lang="ts">
	import { api } from '$lib/api';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { page } from '$app/stores';
	import DateSelect from './DateSelect.svelte';

	export let data;
</script>

<div class="mx-auto max-w-md sm:mx-0 md:max-w-4xl">
	<div class="md:grid md:grid-cols-2 md:divide-x md:divide-neutral-200 md:dark:divide-neutral-600">
		<DateSelect />
		<section
			class="mt-8 flex flex-row flex-wrap items-center justify-center gap-4 md:mt-0 md:justify-start md:pl-7 lg:pl-14">
			<QueryClientProvider client={api.hydrateQueryClient(data.api)}>
				{#key $page.url}
					<slot />
				{/key}
			</QueryClientProvider>
		</section>
	</div>
</div>
