<svelte:options runes={true} />
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'clsx';

	import { cn } from '$lib/utils/cn';
	import { Motion, type MotionProps } from 'svelte-motion';

	const { children,...restProps } = $props<{ children: Snippet, class?: ClassValue, motion?: MotionProps }>();
</script>

<Motion {...restProps.motion} let:motion let:props>
	<div
		{...props}
		use:motion
		class={cn(
			'bg-white dark:bg-gray-800 dark:shadow-neutral-309/20',
			restProps.class,
			'relative flex-shrink-0 snap-center overflow-hidden rounded-xl p-5 shadow-lg lg:flex-grow'
			// { 'px-5 pb-12 pt-5': ScoreCard.arguments.comparison.score }
		)}>
		{#if children()}
			{@render children()}
		{/if}
	</div>
</Motion>
