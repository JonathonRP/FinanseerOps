<script lang="ts">
	import { base } from '$app/paths';
	import { fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import search from '@iconify-icons/tabler/search';
	import MainLayout from '../(app)/MainLayout.svelte';
	import DateSelect from './DateSelect.svelte';

	export let data;

	$: ({
		processedDate,
		processedDay,
		searchFilter,
		url: { pathname },
	} = data);

	$: preserveState = processedDate ? `?${new URLSearchParams({ processedDate })}` : undefined;

	$: links = (processedDate && [{ route: `${base}/${preserveState}` }]) || undefined;
</script>

<MainLayout name="Finanseer" {links}>
	<div class="mx-auto w-full sm:mx-0 sm:max-w-xl md:max-w-none lg:max-w-6xl">
		<form
			action=""
			method="get"
			class="mb-8 flex h-10 rounded-full border-2 border-neutral-808 dark:border-neutral-309"
			on:formdata={(e) => {
				Array.from(e.formData.entries()).forEach(([k, v]) => !v && e.formData.delete(k));
			}}>
			<input type="hidden" name="processedDate" bind:value={processedDate} />
			<input name="search" class="w-full rounded-full bg-transparent px-3 text-xs" value={searchFilter} />
			<button
				class="flex border-spacing-0 items-center rounded-full bg-neutral-808 px-[0.625rem] py-[0.525rem] text-sm font-semibold text-neutral-309 hover:bg-neutral-900 dark:bg-neutral-309 dark:text-neutral-808 hover:dark:bg-neutral-400">
				<iconify-icon icon={search} inline />
			</button>
		</form>
		<div class="md:grid md:grid-cols-[1fr_2fr] md:divide-x md:divide-neutral-200 md:dark:divide-neutral-600">
			<DateSelect {processedDay} {searchFilter} />
			<div class="my-8 md:mt-0 md:pl-7 lg:pl-14">
				{#key pathname}
					<section
						class="@container"
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
						}}>
						<slot />
					</section>
				{/key}
			</div>
		</div>
	</div>
</MainLayout>
