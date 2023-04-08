<script lang="ts">
	import { api } from '$lib/api';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import DateSelect from './DateSelect.svelte';

	export let data;
</script>

<div class="mx-auto max-w-md px-4 sm:mx-0 sm:px-7 md:max-w-4xl md:px-6">
	<div class="md:grid md:grid-cols-[1fr_1fr] md:divide-x md:divide-neutral-200 md:dark:divide-neutral-600">
		<DateSelect />
		<section class="mt-12 flex flex-row flex-wrap items-center justify-center gap-4 md:mt-0 md:justify-start md:pl-14">
			<QueryClientProvider client={api.hydrateQueryClient(data.api)}>
				<slot />
			</QueryClientProvider>
		</section>
	</div>
</div>
