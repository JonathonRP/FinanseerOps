<script lang="ts">
	import type { Color } from '$lib/utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { spring, tweened } from 'svelte/motion';
	import up from '@iconify-icons/tabler/trending-up';
	import down from '@iconify-icons/tabler/trending-down';
	import DashboardWidget from './DashboardWidget.svelte';

	export let delay: number | undefined | null = null;
	export let label: string;
	export let score: number | undefined;
	export let comparison:
		| Partial<{ score: number; positiveColor?: Color; negativeColor?: Color; swap: boolean }>
		| undefined
		| null = null;

	const numberFormat: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD', notation: 'compact' };

	let locale: string;
	onMount(() => {
		locale = navigator.languages[0] || navigator.language;
	});

	const score$ = tweened(score, { duration: 300 });
	const comparisonScore$ = spring(comparison?.score, { damping: 0.12, stiffness: 0.12 });

	$: if (score) {
		score$.set(score);
	}
	$: if (comparison?.score) {
		comparisonScore$.set(comparison.score);
	}
</script>

<DashboardWidget>
	<div class="text-base text-gray-400 dark:text-gray-300">
		{label}
	</div>
	{#if score}
		<div class="flex w-[164.57px] items-center pt-1">
			<div transition:fade={{ duration: 300 }} class="text-2xl font-bold text-gray-900 dark:text-gray-100">
				{$score$.toLocaleString(locale, numberFormat)}
			</div>

			{#if comparison && comparison.score && comparison.score > 0}
				{@const { compare, positiveColor, negativeColor } = {
					compare: $score$ < comparison.score,
					positiveColor:
						comparison.swap || false ? comparison.negativeColor || 'red' : comparison.positiveColor || 'green',
					negativeColor:
						comparison.swap || false ? comparison.positiveColor || 'green' : comparison.negativeColor || 'red',
				}}
				{@const { color } = { color: compare ? negativeColor : positiveColor }}
				<span
					class="mx-2 flex items-center rounded-full px-2 py-0.5 text-sm
					{color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-emerald-400' : undefined}
					{color === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : undefined}"
					transition:fade={{ duration: 300 }}>
					<span>
						{$comparisonScore$.toLocaleString(locale, numberFormat)}
					</span>
					<iconify-icon inline icon={compare ? down : up} />
				</span>
			{/if}
		</div>
	{:else}
		<div
			class="flex h-full w-[164.57px] animate-pulse flex-row items-center justify-center space-x-5 pr-11 pt-1"
			class:animation-delay-150={delay === 1}
			class:animation-delay-300={delay === 2}
			style="animation-fill-mode: backwards">
			<div
				class="via-gray h-8 w-44 animate-gradient-x rounded-md bg-gradient-to-r from-gray-300 via-white to-gray-50 dark:from-gray-800 dark:via-gray-500 dark:to-gray-600"
				class:animation-delay-150={delay === 1}
				class:animation-delay-300={delay === 2}
				style="animation-fill-mode: backwards" />
		</div>
	{/if}
</DashboardWidget>
