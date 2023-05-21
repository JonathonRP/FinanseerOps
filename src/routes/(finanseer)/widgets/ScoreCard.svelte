<script lang="ts">
	import { type Color, numberFormat } from '$lib/utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { spring, tweened } from 'svelte/motion';
	import up from '@iconify-icons/tabler/trending-up';
	import down from '@iconify-icons/tabler/trending-down';
	import DashboardWidget from '../DashboardWidget.svelte';

	export let label: string;
	export let score: number | undefined | null = null;
	export let swap: boolean | undefined | null = null;
	export let comparison:
		| Partial<{ score: number; positiveColor?: Color; negativeColor?: Color; swap: boolean }>
		| undefined
		| null = null;

	let locale: string;
	onMount(() => {
		locale = navigator?.languages[0] || navigator?.language;
	});

	const score$ = tweened(0, { duration: 300 });
	const comparisonScore$ = spring(0, { damping: 0.5, stiffness: 0.5 });

	$: if (score !== null && score !== undefined) {
		score$.set(score);
	}
	$: if (comparison && comparison.score) {
		comparisonScore$.set(comparison.score);
	}
</script>

<DashboardWidget hasAdditional={$$slots.additional}>
	<dt>
		<p class="text-base text-gray-400 dark:text-gray-300">
			{label}
		</p>
	</dt>
	<dd class="flex w-[164.57px] items-start pt-1 text-gray-900 dark:text-gray-100 {$$slots.default && 'h-[64px]'}">
		<div class="flex items-center">
			{#if score !== null && score !== undefined}
				<p transition:fade={{ duration: 300 }} class="text-2xl font-bold text-gray-900 dark:text-gray-100">
					{numberFormat(locale).format($score$)}
				</p>

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
						class="mx-2 flex items-center rounded-full px-2 py-0.5 text-sm
					{color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-emerald-400' : undefined}
					{color === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : undefined}"
						transition:fade={{ duration: 300 }}>
						{numberFormat(locale).format($comparisonScore$)}
						<iconify-icon inline icon={compare ? down : up} />
					</p>
				{/if}
			{/if}
		</div>
		{#if $$slots.default}
			<slot />
		{/if}
		{#if $$slots.additional}
			<div
				class="absolute inset-x-0 bottom-0 bg-gray-50 px-6 py-[.60rem] text-sm text-primary-500 dark:bg-slate-900/40">
				<slot name="additional" />
			</div>
		{/if}
	</dd>
</DashboardWidget>
