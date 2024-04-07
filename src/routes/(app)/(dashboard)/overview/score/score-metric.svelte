<svelte:options runes={true} />

<script lang="ts">
	import type { ComponentType, SvelteComponent } from 'svelte';
	import { cn, numberFormat, type Color } from '$/lib/utils';
	import { spring, tweened } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { scoreCardIcons } from '$/icons';
	import AnimatedNumber from '$/lib/components/AnimatedNumber.svelte';
	import { string } from 'zod';
	import type { DefaultPropsType } from '.';

	const {
		value,
		swap,
		comparison,
		children,
		...restProps
	}: {
		value?: number;
		swap?: boolean;
		comparison?: Partial<{
			value: number;
			positiveColor: Color;
			negativeColor: Color;
			swap: boolean;
		}>;
	} & Partial<DefaultPropsType> = $props();

	const score$ = tweened(0, { duration: 300 });
	const comparisonScore$ = spring(0, { damping: 0.5, stiffness: 0.5 });
	const differenceScore$ = spring(0, { damping: 0.5, stiffness: 0.5 });

	$effect(() => {
		score$.set(value ?? 0);
		comparisonScore$.set(comparison?.value ?? 0);
		differenceScore$.set(Math.abs($score$ - ($comparisonScore$ ?? 0)));
	});

	const scoreIcons = $derived(
		new Map<boolean, ComponentType<SvelteComponent>>(
			Object.values(scoreCardIcons).map((icon, indx) => [indx === 1, icon])
		)
	);
</script>

<div class="flex items-center">
	{#if value !== null && value !== undefined}
		<p class={cn('text-2xl font-bold', restProps.class)}>
			<span class="flex min-w-[3ch] flex-nowrap overflow-hidden items-baseline">
				{numberFormat().format($score$).slice(0, 1)}
				{#each numberFormat().format($score$).slice(1, -1).split('') as digit}
					{#if !Number(digit) && digit !== '0'}
						{digit}
					{:else}
						<AnimatedNumber value={digit} class="font-bold leading-snug" />
					{/if}
				{/each}
				{numberFormat().format($score$).slice(-1)}
			</span>
		</p>

		{#if comparison && comparison.value && ($comparisonScore$ ?? 0) > 0}
			{@const { compare, positiveColor, negativeColor } = {
				compare: comparison.swap ? value > ($comparisonScore$ ?? 0) : value < ($comparisonScore$ ?? 0),
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
				)}>
				{numberFormat().format($differenceScore$ ?? 0)}
				<svelte:component this={scoreIcons.get(compare)} inline />
			</p>
		{/if}
	{/if}
</div>
{#if children}
	{@render children()}
{/if}
{#if comparison?.value}
	<p class="absolute inset-x-0 bottom-0 pb-[1.2rem] pl-5 text-xs font-normal text-muted-foreground">
		Compared to ({numberFormat().format($comparisonScore$ ?? 0)} last month)
	</p>
{/if}
