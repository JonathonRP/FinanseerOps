<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Motion } from 'svelte-motion';

	import ScoreCard from './ScoreCard.svelte';
</script>

<Motion {...$$restProps} let:motion let:props>
	<div
		{...props}
		use:motion
		class={cn(
			'bg-white dark:bg-gray-800 dark:shadow-neutral-309/20',
			$$restProps.class,
			'relative flex-shrink-0 snap-center overflow-hidden rounded-xl p-5 shadow-lg lg:flex-grow'
			// { 'px-5 pb-12 pt-5': ScoreCard.arguments.comparison.score }
		)}>
		{#if $$slots.default}
			<slot {ScoreCard} />
		{/if}
	</div>
</Motion>
