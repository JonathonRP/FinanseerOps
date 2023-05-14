<script lang="ts">
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { derived } from 'svelte/store';
	import * as d3 from 'd3';
	import { numberFormat } from '$lib/utils';

	export let data: [value: number, limit: number, monthQuerter: number];

	const value = tweened(0, { duration: 800, easing: cubicInOut });

	$: [$value, limit, monthQuerter] = data;

	$: percent = derived(value, ($value) => Math.round(($value / limit) * 100));

	// Settings
	const angle = 0.5 * Math.PI;
	const radis = 74;

	const arc = d3
		.arc()
		.innerRadius(58)
		.cornerRadius(20)
		.outerRadius(radis)
		.startAngle(angle * -1);

	let locale: string;
	onMount(() => {
		locale = navigator.languages[0] || navigator.language;
	});

	const gauge = derived(value, ($value) => arc.endAngle(-angle + ($value / limit) * 2 * angle));
</script>

<div
	class="@container relative h-full w-full"
	style:--marginTop="5px"
	style:--marginLeft="5px"
	style:--marginRight="54px"
	style:--marginBottom="0px">
	<!-- Chart area -->
	<svg
		class="absolute inset-0
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible">
		<svg class="overflow-visible" viewBox={`0 0 148 74`} preserveAspectRatio="none">
			<!-- transform={`translate(${148 / 2}, calc(${148 / 3} + var(--marginTop) ))`} -->
			<!-- class="translate-x-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-y-[calc(100%-var(--marginTop)-var(--marginBottom))]" -->
			<g transform={`translate(74, 74)`}>
				<path
					d={arc.endAngle(angle)()}
					class="fill-slate-200 dark:fill-slate-400"
					vector-effect="non-scaling-stroke"
					fill="currentColor" />
				{#if $percent > 0}
					<path
						d={$gauge()}
						class={($percent > 75 && monthQuerter < 50 && 'fill-red-500 dark:fill-red-900') ||
							($percent > 50 && monthQuerter < 75 && 'fill-yellow-500 dark:fill-yellow-500') ||
							'fill-green-500 dark:fill-green-900'}
						vector-effect="non-scaling-stroke"
						fill="currentColor" />
				{/if}
				<g class="legend">
					<text
						y="-15"
						class="text-lg font-bold"
						alignment-baseline="after-edge"
						text-anchor="middle"
						fill="currentColor">
						{$percent}%
					</text>
					<text x="40" y="0" class="text-xs" alignment-baseline="after-edge" text-anchor="middle" fill="currentColor">
						{limit.toLocaleString(locale, numberFormat)}
					</text>
				</g>
				{#if $percent > 0}
					<text
						class="text-xs dark:stroke-black"
						alignment-baseline="middle"
						text-anchor="middle"
						fill="currentColor"
						paint-order="stroke"
						stroke="currentColor"
						stroke-width="1.5px"
						stroke-linecap="butt"
						stroke-linejoin="miter"
						transform={`translate(${$gauge.centroid($gauge())[0]},${$gauge.centroid($gauge())[1] + angle})`}>
						{$value.toLocaleString(locale, numberFormat)}
					</text>
				{/if}
			</g>
		</svg>
	</svg>
</div>
