<svelte:options runes={true} />

<script lang="ts">
	import {
		AnimatePresence,
		AnimateSharedLayout,
		motionValue,
		useDragControls,
		useMotionValue,
		type Variants,
	} from 'svelte-motion';
	import { staggerChildren, ease } from '$lib/animations';
	import { Reorder } from '$lib/components/Reorder';
	import { icons } from '$/icons';
	import { cn } from '$lib/utils';
	import { defaultWidgets, denseWidgets } from './widgets';

	const { data }: { data: import('./$types').PageData } = $props();
	const { user } = $derived(data);

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
		console.log(dashboardUserLayout);
	});
</script>

<svelte:head>
	<title>Finanseer</title>
	<meta name="description" content="Finanzen Portal overview" />
</svelte:head>

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
	class="relative flex snap-y snap-mandatory flex-col flex-wrap items-center gap-4 overflow-visible pb-3 scrollbar-none md:max-w-none md:flex-row md:items-start">
	{#each dashboardUserLayout as widget (widget)}
		{@const dragControls = useDragControls()}
		{@const             startDrag = (event: MouseEvent | TouchEvent | PointerEvent) => {
				dragControls.start(event);
			}
		}
		<Reorder.Item drag dragListener={false} {dragControls} value={widget} variants={fadeUp} class="relative">
			<svelte:component this={widgets.get(widget)} />
			<span
				class="absolute right-2 top-2 cursor-grab rounded-sm bg-background bg-opacity-25 mix-blend-overlay active:cursor-grabbing"
				onpointerdown={(e) => {
					e.preventDefault();
					e.stopPropagation();
					startDrag(e);
				}}>
				<svelte:component this={icons.ReorderIcon} height="auto" class="h-5 w-5" />
			</span>
		</Reorder.Item>
	{/each}
</Reorder.Group>
