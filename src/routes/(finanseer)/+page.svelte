<svelte:options runes={true} />

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { staggerChildren, fadeUp } from '$lib/animations';
	import { defaultWidgets, denseWidgets } from './widgets';

	const { data } = $props<{ data: import('./$types').PageData }>();
	const { user } = $derived(data);

	const widgets = $derived(
		(user?.widgetStyle === 'dense' && new Map(Object.entries(denseWidgets))) || new Map(Object.entries(defaultWidgets))
	);

	const dashboardUserLayout = $derived(Array.from(widgets.keys()));
</script>

<svelte:head>
	<title>Finanseer</title>
	<meta name="description" content="Finanseer Finanzen Portal" />
</svelte:head>

<Motion let:motion={stagger} variants={staggerChildren} initial="initial" animate="animate" exit={{ opacity: 0 }}>
	<dl
		use:stagger
		class="flex snap-y snap-mandatory flex-col items-center gap-4 overflow-y-auto pb-3 scrollbar-none md:flex-row md:items-start md:px-2">
		{#each dashboardUserLayout as widget, index (index)}
			<svelte:component this={widgets.get(widget)} variants={fadeUp} />
		{/each}
	</dl>
</Motion>
