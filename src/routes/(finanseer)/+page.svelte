<script lang="ts">
	import { widgets } from '$lib/utils';

	export let data;
	$: ({ processedDay } = data);

	const dashboardUserLayout = ['balance', 'spent', 'forecast'];
</script>

<svelte:head>
	<title>Finanseer</title>
	<meta name="description" content="Finanseer Finanzen Portal" />
</svelte:head>

{#each dashboardUserLayout as widget, index (index)}
	<svelte:component this={widgets.get(widget)} {processedDay} delay={index} />
{/each}
