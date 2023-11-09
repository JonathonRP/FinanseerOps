<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { Motion } from 'svelte-motion';
	import { staggerChildren, fadeUp } from '$lib/animations';
	import { defaultWidgets, denseWidgets } from './widgets';

	export let data;
	$: ({ session, processedDay, searchFilter } = data);

	$: widgets =
		(session.user?.widgetStyle === 'dense' && new Map<string, ComponentType>(Object.entries(denseWidgets))) ||
		new Map<string, ComponentType>(Object.entries(defaultWidgets));

	$: dashboardUserLayout = Array.from(widgets.keys());
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
			<Motion let:motion={fadeInUp} variants={fadeUp}>
				<div use:fadeInUp>
					/// TODO - make components motion components.
					<svelte:component
						this={widgets.get(widget)}
						id={widget}
						{...{
							...(widget !== 'balance' && {
								processedDay,
								searchFilter,
							}),
							...{},
						}} />
				</div>
			</Motion>
		{/each}
	</dl>
</Motion>
