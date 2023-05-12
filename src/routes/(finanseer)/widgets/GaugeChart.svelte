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
	export let width = 148;
	export let height: number = undefined || width;
	const angle = 0.5 * Math.PI;
	const radis = Math.min(width, 2 * height) / 2;

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

<svg class="bg-transparent" viewBox={`0 0 ${width} ${height / 2}`}>
	<g transform={`translate(${width / 2},${height / 2})`}>
		<path d={arc.endAngle(angle)()} class="fill-slate-200 dark:fill-slate-400" fill="currentColor" />
		{#if $percent > 0}
			<path
				d={$gauge()}
				class={($percent > 75 && monthQuerter < 50 && 'fill-red-500 dark:fill-red-900') ||
					($percent > 50 && monthQuerter < 75 && 'fill-yellow-500 dark:fill-yellow-500') ||
					'fill-green-500 dark:fill-green-900'}
				fill="currentColor" />
		{/if}
		<g class="legend" transform={`translate(${-(width / 2) - 25}, ${-95})`}>
			<text x="22" y="12" text-anchor="middle" fill="currentColor" transform={`translate(${width / 2}, ${height / 2})`}>
				{$value.toLocaleString(locale, numberFormat)} / {limit.toLocaleString(locale, numberFormat)}
			</text>
		</g>
		{#if $percent > 0}
			<text
				class="dark:stroke-black"
				alignment-baseline="middle"
				text-anchor="middle"
				fill="currentColor"
				paint-order="stroke"
				stroke="currentColor"
				stroke-width="1.5px"
				stroke-linecap="butt"
				stroke-linejoin="miter"
				transform={`translate(${$gauge.centroid($gauge())[0]},${$gauge.centroid($gauge())[1] + angle}) scale(.7)`}>
				{$percent}%
			</text>
		{/if}
	</g>
</svg>
