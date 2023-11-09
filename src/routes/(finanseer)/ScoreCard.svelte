<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { type Color, numberFormat, cn } from '$lib/utils';
	import { spring } from 'svelte/motion';
	import icons from '../icons';
	import Label from './Label.svelte';
	import Score from './Score.svelte';

	export let swap: boolean | undefined | null = null;
	export let comparison:
		| Partial<{ score: number; positiveColor?: Color; negativeColor?: Color; swap: boolean }>
		| undefined
		| null = null;

	const comparisonScore$ = spring(0, { damping: 0.5, stiffness: 0.5 });

	$: if (comparison && comparison.score) {
		comparisonScore$.set(comparison.score);
	}

	$: scoreCardIcons = new Map<boolean, ComponentType>(
		Object.values(icons.scoreCardIcons).map((icon, indx) => [indx === 1, icon])
	);
</script>

<dt>
	<slot name="label" {Label} />
</dt>
<dd class="flex w-[164.57px] items-start pt-1 text-gray-900 dark:text-gray-100 {($$slots.default && 'h-[64px]') || ''}">
	<div class="flex items-center">
		{#if score !== null && score !== undefined}
			<slot name="score" {Score} />

			{#if comparison && comparison.score && comparison.score > 0}
				{@const { compare, positiveColor, negativeColor } = {
					compare: comparison.swap ? score > comparison.score : score < comparison.score,
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
					{numberFormat().format(Math.abs($score$ - $comparisonScore$))}
					<svelte:component this={scoreCardIcons.get(compare)} inline />
				</p>
			{/if}
		{/if}
	</div>
	{#if $$slots.default}
		<slot />
	{/if}
	{#if comparison?.score}
		<p class="absolute inset-x-0 bottom-0 pb-[1.2rem] pl-5 text-xs font-normal text-gray-400 dark:text-slate-300">
			Compared to ({numberFormat().format($comparisonScore$)} last month)
		</p>
	{/if}
</dd>
