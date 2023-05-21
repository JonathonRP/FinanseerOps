<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { defaultWidgets, adminWidgets } from './widgets';

	export let data;
	$: ({ session, processedDay, searchFilter } = data);

	$: widgets =
		(session.user?.role === 'admin' && new Map<string, ComponentType>(Object.entries(adminWidgets))) ||
		new Map<string, ComponentType>(Object.entries(defaultWidgets));

	$: dashboardUserLayout = Array.from(widgets.keys());
</script>

<svelte:head>
	<title>Finanseer</title>
	<meta name="description" content="Finanseer Finanzen Portal" />
</svelte:head>

<dl
	class="flex flex-col-reverse items-center justify-center gap-4 md:items-start md:@md:flex-row-reverse md:@md:flex-wrap md:@md:justify-end">
	{#each dashboardUserLayout.reverse() as widget, index (index)}
		<svelte:component
			this={widgets.get(widget)}
			{...{ ...(widget !== 'balance' && { processedDay, searchFilter }), ...{} }} />
	{/each}
</dl>
