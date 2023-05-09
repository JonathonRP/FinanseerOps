<script lang="ts">
	import type { ComponentType } from 'svelte';
	import defaultWidgets from './widgets';

	export let data;
	$: ({ processedDay, session } = data);

	$: widgets =
		(session.user?.role === 'admin' && new Map<string, ComponentType>(Object.entries(defaultWidgets))) ||
		new Map<string, ComponentType>(Object.entries(defaultWidgets));

	$: dashboardUserLayout = Array.from(widgets.keys());
</script>

<svelte:head>
	<title>Finanseer</title>
	<meta name="description" content="Finanseer Finanzen Portal" />
</svelte:head>

{#each dashboardUserLayout as widget, index (index)}
	<svelte:component this={widgets.get(widget)} {...{ ...(widget !== 'balance' && { processedDay }), ...{} }} />
{/each}
