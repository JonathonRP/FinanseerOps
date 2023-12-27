<svelte:options runes={true} />
<script lang="ts">
	import { getContext, type Snippet } from "svelte";
	import type { ClassValue } from "clsx";
	import type { Readable } from "svelte/store";
	import { cn, numberFormat, type Color } from "$/lib/utils/index.svelte";
	import { tweened } from "svelte/motion";

    const {value, data, children, ...restProps} = $props<{
		value?: number,
		data?: number[], 
		children?: Snippet<number[] | undefined>, 
		class?: ClassValue
	}>();

	const { comparison, comparisonScore$ } = getContext<{swap?: boolean, comparison?: Partial<{ score: number; positiveColor: Color; negativeColor: Color; swap: boolean}>, comparisonScore$?: Readable<number>}>('ScoreCard')

    const score$ = tweened(0, {duration: 300});

	$effect(() => {
		$score$ = value ?? 0
	});
</script>

<dd class={cn("flex w-[164.57px] items-start pt-1 text-gray-900 dark:text-gray-100", restProps.class, {'h-[64px]': children})}>
	{#if children}
		{@render children(data)}
	{/if}
	{#if comparison?.score}
		<p class="absolute inset-x-0 bottom-0 pb-[1.2rem] pl-5 text-xs font-normal text-gray-400 dark:text-slate-300">
			Compared to ({numberFormat().format($comparisonScore$ ?? 0)} last month)
		</p>
	{/if}
</dd>