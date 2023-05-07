<script lang="ts">
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { sineInOut } from 'svelte/easing';
	import { derived } from 'svelte/store';
	import * as d3 from 'd3';
	import { numberFormat } from '$lib/utils';

	export let data: [value: number, range: number];

	const value = tweened(0, { duration: 700, easing: sineInOut });

	$: [$value, limit] = data;

	$: percent = derived(value, ($value) => Math.round(($value / limit) * 100));

	// Settings
	export let width: number;
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

<svg class="bg-transparent text-gray-900 dark:text-gray-100" viewBox={`0 0 ${width} ${height / 2}`}>
	<g transform={`translate(${width / 2},${height / 2})`}>
		<path d={arc.endAngle(angle)()} class="fill-slate-200 dark:fill-slate-400" fill="currentColor" />
		<path
			d={arc.endAngle(-angle + ($value / data[1]) * 2 * angle)()}
			class={($percent > 85 && 'fill-red-100 dark:fill-red-900') ||
				($percent > 50 && 'fill-yellow-100 dark:fill-yellow-500') ||
				'fill-green-100 dark:fill-green-900'}
			fill="currentColor" />
		<g class="legend" transform={`translate(${-(width / 2) - 25}, ${-95})`}>
			<text x="22" y="12" text-anchor="middle" fill="currentColor" transform={`translate(${width / 2}, ${height / 2})`}>
				{$value.toLocaleString(locale, numberFormat)} / {data[1].toLocaleString(locale, numberFormat)}
			</text>
		</g>
		<text
			text-anchor="end"
			fill="currentColor"
			transform={`translate(${$gauge.centroid($gauge())[0] + angle * 4},${
				$gauge.centroid($gauge())[1] + angle * 4
			}) scale(.6)`}>
			{#if $percent > 0}
				{$percent}%
			{/if}
		</text>
	</g>
</svg>
