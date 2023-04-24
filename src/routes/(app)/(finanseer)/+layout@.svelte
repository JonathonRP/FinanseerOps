<script lang="ts">
	import { base } from '$app/paths';
	import MainLayout from '../MainLayout.svelte';
	import DateSelect from './DateSelect.svelte';

	export let data;

	$: ({
		processedDate,
		processedDay,
		url: { pathname },
	} = data);

	$: preserveState = processedDate ? `?${new URLSearchParams({ processedDate })}` : undefined;

	$: links =
		(processedDate && [
			{ route: `${base}/${preserveState}` },
			{ route: `${base}/transactions${preserveState}` },
			{ route: false ? `${base}/analytics${preserveState}` : '/maintenance' },
		]) ||
		undefined;
</script>

<MainLayout name="Finanseer" {links}>
	<div class="mx-auto max-w-md sm:mx-0 md:max-w-4xl">
		<div class="md:grid md:grid-cols-2 md:divide-x md:divide-neutral-200 md:dark:divide-neutral-600">
			<DateSelect {processedDay} />
			<section
				class="mt-8 flex flex-row flex-wrap items-center justify-center gap-4 md:mt-0 md:justify-start md:pl-7 lg:pl-14">
				{#key pathname}
					<slot />
				{/key}
			</section>
		</div>
	</div>
</MainLayout>
