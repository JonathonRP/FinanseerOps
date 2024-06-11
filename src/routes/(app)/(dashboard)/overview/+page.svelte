<svelte:options runes={true} />

<script lang="ts">
	import { icons } from '$/icons';
	import { cn } from '$/lib/utils';
	import { ease } from '$lib/animations';
	import { Reorder } from '$lib/components/Reorder';
	import { useDragControls, type Variants } from 'svelte-motion';
	import { defaultWidgets, denseWidgets } from './widgets';
	import SpendingBehaviorWidget from './widgets/SpendingBehaviorWidget.svelte';

	const { data }: { data: import('./$types').PageData } = $props();
	const { user } = $derived(data);

	const md = window.matchMedia('(max-width:768px)');
	const mdState = $state({ isMobile: md.matches });

	const widgets = $derived(
		(user?.widgetStyle === 'dense' && new Map(Object.entries(denseWidgets))) || new Map(Object.entries(defaultWidgets))
	);

	const dashboardUserLayout = $state(Array.from(widgets.keys()));

	const fadeUp: Variants = {
		hidden: {
			y: 60,
			opacity: 0,
		},
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				duration: 0.8,
				ease,
			},
		},
	};

	$effect(() => {
		const handler = (e: MediaQueryListEvent) => {
			mdState.isMobile = e.matches;
		};

		// @ts-expect-error
		'addEventListener' in md ? md.addEventListener('change', handler) : md.addListener(handler);

		// @ts-expect-error
		return () => ('removeEventListener' in md ? md.removeEventListener('change', handler) : md.removeListener(handler));
	});
	// $effect(() => {
	// 	console.log(dashboardUserLayout);
	// });
</script>

<svelte:head>
	<title>Finanzen Dashboard - Finanseer</title>
	<meta name="description" content="Finanzen Portal overview" />
</svelte:head>

{#if mdState.isMobile}
	<SpendingBehaviorWidget />
{:else}
	<Reorder.Group
		layout
		onReorder={(keys) => {
			dashboardUserLayout.sort((a, b) => keys.indexOf(a) - keys.indexOf(b));
		}}
		values={dashboardUserLayout}
		initial="hidden"
		animate="visible"
		exit={{ opacity: 0, zIndex: 0, position: 'fixed' }}
		transition={{ duration: 0.8, staggerChildren: 0.35 }}
		class="relative mx-auto hidden grid-cols-1 gap-4 overflow-visible pb-3 md:grid md:max-w-screen-xl md:grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))]">
		{#each dashboardUserLayout as widget (widget)}
			{@const dragControls = useDragControls()}
			{@const startDrag = (event: PointerEvent) => {
				dragControls.start(event);
			}
		}
			<Reorder.Item
				drag
				dragListener={false}
				{dragControls}
				value={widget}
				variants={fadeUp}
				class={cn('relative h-full', { 'lg:row-span-2': widget === 'categories' })}>
				<svelte:component this={widgets.get(widget)} />
				<span
					class="absolute right-2 top-2 cursor-grab rounded-sm bg-background bg-opacity-25 active:cursor-grabbing dark:mix-blend-overlay"
					onpointerdown={(e) => {
						e.preventDefault();
						e.stopPropagation();
						startDrag(e);
					}}>
					<svelte:component this={icons.ReorderIcon} height="auto" class="size-5" />
				</span>
			</Reorder.Item>
		{/each}
	</Reorder.Group>
{/if}
