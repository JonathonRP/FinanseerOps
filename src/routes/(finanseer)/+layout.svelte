<script lang="ts">
	import { base } from '$app/paths';
	import { fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import MainLayout from '../(app)/MainLayout.svelte';
	import DateSelect from './DateSelect.svelte';

	export let data;

	$: ({
		processedDate,
		processedDay,
		url: { pathname },
	} = data);

	$: preserveState = processedDate ? `?${new URLSearchParams({ processedDate })}` : undefined;

	$: links =
		(processedDate && [{ route: `${base}/${preserveState}` }, { route: `${base}/transactions${preserveState}` }]) ||
		undefined;
</script>

<MainLayout name="Finanseer" {links}>
	<div class="mx-auto max-w-md sm:mx-0 md:w-full md:max-w-4xl">
		<div class="md:grid md:grid-cols-2 md:divide-x md:divide-neutral-200 md:dark:divide-neutral-600">
			<DateSelect {processedDay} />
			<div class="mt-8 flex flex-col md:mt-0 md:pl-7 lg:pl-14">
				{#key pathname}
					<section
						in:fly={{
							y: -400 * (pathname === '/' ? 1 : -1),
							duration: 500 / 2,
							delay: 200 / 2,
							opacity: 0,
							easing: cubicInOut,
						}}
						out:fly={{
							y: -400 * (pathname === '/' ? -1 : 1),
							duration: 500 / 2,
							delay: 100 / 2,
							opacity: 0,
							easing: cubicInOut,
						}}
						class="flex flex-row flex-wrap items-center justify-center gap-4 md:justify-start">
						<slot />
					</section>
				{/key}
			</div>
		</div>
	</div>
</MainLayout>
