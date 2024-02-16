<svelte:options runes={true} />

<script lang="ts">
	import type { ComponentType, Snippet, SvelteComponent } from 'svelte';
	import type { ClassValue } from 'clsx';
	import { cn, numberFormat, type Color } from '$/lib/utils';
	import { spring, tweened } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { scoreCardIcons } from '$/icons';

	const { value, swap, comparison, children, ...restProps } = $props<{
		value?: number;
		swap?: boolean;
		comparison?: Partial<{ value: number; positiveColor: Color; negativeColor: Color; swap: boolean }>;
		children?: Snippet<[number[] | undefined]>;
		class?: ClassValue;
	}>();

	const score$ = tweened(0, { duration: 300 });

	$effect(() => {
		$score$ = value ?? 0;
	});

	const comparisonScore$ = spring(0, { damping: 0.5, stiffness: 0.5 });

	$effect(() => {
		$comparisonScore$ = comparison?.value ?? 0;
	});

	const scoreIcons = $derived(
		new Map<boolean, ComponentType<SvelteComponent>>(
			Object.values(scoreCardIcons).map((icon, indx) => [indx === 1, icon])
		)
	);
</script>

<div class="flex items-center">
	{#if value !== null && value !== undefined}
		<p
			transition:fade={{ duration: 300 }}
			class={cn('text-2xl font-bold text-gray-900 dark:text-gray-100', restProps.class)}>
			{numberFormat().format($score$)}
		</p>

		{#if comparison && comparison.value && comparison.value > 0}
			{@const { compare, positiveColor, negativeColor } = {
				compare: comparison.swap ? value > comparison.value : value < comparison.value,
				positiveColor: swap || false ? comparison.negativeColor || 'red' : comparison.positiveColor || 'green',
				negativeColor: swap || false ? comparison.positiveColor || 'green' : comparison.negativeColor || 'red',
			}}
			{@const { color } = {
				color: comparison.swap
					? (compare && positiveColor) || negativeColor
					: (compare && negativeColor) || positiveColor,
			}}
			<p
				class={cn(
					`mx-2 flex items-center rounded-full px-2 py-0.5 text-sm bg-${color}-100 text-${color}-600 dark:bg-${color}-900 dark:text-${
						color === 'green' ? 'emerald-400' : 'red-300'
					}`
				)}
				transition:fade={{ duration: 300 }}>
				{numberFormat().format(Math.abs($score$ - ($comparisonScore$ ?? 0)))}
				<svelte:component this={scoreIcons.get(compare)} inline />
			</p>
		{/if}
	{/if}
</div>
