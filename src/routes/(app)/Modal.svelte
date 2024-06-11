<svelte:options runes={true} />

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { classes } from 'svelte-transition-classes';
	import { Drawer } from '$lib/components/ui/drawer';

	import { writable } from 'svelte/store';
	import { browser } from '$app/environment';

	const {
		isOpen,
		children,
		onclose: onClose,
	}: { isOpen: boolean; children: Snippet; onclose: (event: Event) => void } = $props();

	const open = writable(false);
	// const dragControls = useDragControls();
	// const animateControls = useAnimation();
	const md = browser ? window.matchMedia('(max-width:768px)') : undefined;
	const mdState = $state({ isMobile: md?.matches ?? false });

	// const overlayVariants: Variants = {
	// 	hidden: { opacity: 0, scale: 0.8, transition: { opacity: { duration: 0.2 }, scale: { duration: 1.5 } } },
	// 	visible: { opacity: 1, scale: 1 },
	// };

	// const panelVariants = $derived({
	// 	hidden: {
	// 		y: mdState.isMobile ? 1000 : 0,
	// 		transition: {
	// 			type: 'spring',
	// 			damping: 30,
	// 			stiffness: 300,
	// 			y: {
	// 				duration: 0.5,
	// 			},
	// 		},
	// 	},
	// 	visible: {
	// 		y: 0,
	// 		transition: {
	// 			type: 'spring',
	// 			damping: 30,
	// 			stiffness: 300,
	// 		},
	// 	},
	// });

	// onMount(async () => {
	// 	await animateControls.start('visible');
	// });

	// const startDrag = (event: MouseEvent | TouchEvent | PointerEvent) => {
	// 	dragControls.start(event);
	// };

	$effect(() => {
		const handler = (e: MediaQueryListEvent) => {
			mdState.isMobile = e.matches;
		};

		// @ts-expect-error
		'addEventListener' in md ? md.addEventListener('change', handler) : md.addListener(handler);

		// @ts-expect-error
		return () => ('removeEventListener' in md ? md.removeEventListener('change', handler) : md.removeListener(handler));
	});

	$effect(() => {
		open.set(isOpen);
	});
</script>

<Drawer.Root shouldScaleBackground open={$open && mdState.isMobile} onClose={() => onClose(new Event('close'))}>
	<Drawer.Content>
		{@render children()}
	</Drawer.Content>
</Drawer.Root>
{#if $open && !mdState.isMobile}
	<div
		in:classes={{
			duration: 350,
			base: 'md:transition md:duration-350',
			from: 'md:-translate-x-1/2 md:opacity-0',
			to: 'md:translate-x-0 md:opacity-100',
		}}
		out:classes={{
			duration: 150,
			base: 'md:transition md:duration-150',
			from: 'md:translate-x-0 md:opacity-100',
			to: 'md:-translate-x-1/2 md:opacity-0',
		}}
		class="hidden md:static md:inset-y-0 md:left-16 md:mx-0 md:block md:h-auto md:w-72 md:bg-inherit md:shadow-none md:dark:bg-inherit">
		{@render children()}
	</div>
{/if}
