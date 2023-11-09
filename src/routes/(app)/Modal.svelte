<script lang="ts">
	import { Motion, useDragControls, useAnimation, type Variants } from 'svelte-motion';
	import { createEventDispatcher, onMount } from 'svelte';
	import { mediaQuery } from '$lib/stores/mediaQuery';

	const dispatch = createEventDispatcher();
	const dragControls = useDragControls();
	const animateControls = useAnimation();
	const md = mediaQuery('(max-width:768px)');

	const overlayVariants: Variants = {
		hidden: { opacity: 0, scale: 0.8, transition: { opacity: { duration: 0.2 }, scale: { duration: 1.5 } } },
		visible: { opacity: 1, scale: 1 },
	};

	$: panelVariants = {
		hidden: {
			y: $md ? 1000 : 0,
			transition: {
				type: 'spring',
				damping: 30,
				stiffness: 300,
				y: {
					duration: 0.5,
				},
			},
		},
		visible: {
			y: 0,
			transition: {
				type: 'spring',
				damping: 30,
				stiffness: 300,
			},
		},
	};

	onMount(() => {
		animateControls.start('visible');
	});

	const startDrag = (event: MouseEvent | TouchEvent | PointerEvent) => {
		dragControls.start(event);
	};
</script>

<Motion let:motion initial="hidden" animate="visible" exit="hidden" variants={overlayVariants}>
	<div
		use:motion
		style:--bg-modal={'rgba(4, 15, 39, 0.8)'}
		style:--bg-dark-modal={'rgba(251, 240, 216, 0.8)'}
		class="max-md:fixed max-md:inset-0 max-md:z-10 max-md:bg-[--bg-modal] max-md:backdrop-blur-[0.4rem] max-md:dark:bg-[--bg-dark-modal] max-md:dark:backdrop-blur-[0.4rem]"
		on:click={(e) => dispatch('close', e)}
		on:keydown={(e) => dispatch('close', e)} />
</Motion>
<Motion
	let:motion
	initial="hidden"
	animate="visible"
	exit="hidden"
	variants={panelVariants}
	drag="y"
	dragConstraints={{ top: 0, bottom: 1000 }}
	dragElastic={0.05}
	onDragEnd={(e, info) => {
		if (info.velocity.y > 10 || info.offset.y > 200) {
			dispatch('close', e);
		} else {
			animateControls.set({ y: 0 });
		}
	}}
	{dragControls}>
	<div
		use:motion
		class="z-10 h-full max-md:fixed max-md:inset-x-2 max-md:bottom-0 max-md:top-40 max-md:mx-auto max-md:max-w-sm max-md:rounded-t-2xl max-md:bg-white max-md:shadow-md max-md:dark:bg-gray-800 max-md:dark:shadow-neutral-309/20">
		<div
			aria-label="Handle"
			class="mx-auto mt-4 h-4 w-28 touch-none rounded-lg bg-black opacity-[.09] dark:bg-white dark:opacity-5 md:hidden"
			on:pointerdown={startDrag} />
		<div class="max-md:mx-auto max-md:h-[calc(100%-12rem)] max-md:w-64 md:h-full md:w-full">
			<slot />
		</div>
	</div>
</Motion>
