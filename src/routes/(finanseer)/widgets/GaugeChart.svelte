<script lang="ts">
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { derived } from 'svelte/store';
	import { draw } from 'svelte/transition';

	export let data: number[];

	// Settings
	const angle = 0.5 * Math.PI;
	const radis = 74;
	const size = 16;
	const innerRadius = radis - size;
	// const outerRadius = innerRadius + size;

	const gauge = d3.arc().cornerRadius(20);

	const remaining = (percentage: number) => 100 - percentage;

	$: motion_series = data.map((value, indx) => {
		const color = d3.scaleOrdinal(d3.schemeTableau10).domain(['0', '1']);
		const valueStore = tweened(0, { duration: 800, delay: 800 * indx * 1, easing: cubicInOut });

		valueStore.set(value);

		const pie = d3
			.pie()
			.sort(null)
			.startAngle(angle * -1)
			.endAngle(angle);

		const innerSize = size / data.length - 0.4;
		const radius = radis - innerSize * indx;

		const comp = derived(valueStore, (valuestore) => pie([valuestore, remaining(valuestore)])[0]);

		return derived(comp, (compstore) => ({
			gauge: {
				path: gauge({
					innerRadius: radius - ((innerSize * data.length) / data.length) * indx,
					outerRadius: innerRadius + (innerSize * data.length) / data.length,
					startAngle: compstore.startAngle,
					endAngle: angle,
				}),
			},
			path: gauge({
				innerRadius: radius - ((innerSize * data.length) / data.length) * indx,
				outerRadius: innerRadius + (innerSize * data.length) / data.length,
				startAngle: compstore.startAngle,
				endAngle: compstore.endAngle,
			}),
			color: color(indx.toString()),
		}));
	});

	$: series = derived(motion_series, (m_series) => m_series);

	let locale: string;
	onMount(() => {
		locale = navigator?.languages[0] || navigator?.language;
	});
</script>

<div
	class="relative h-full w-full @container"
	style:--marginTop="0px"
	style:--marginLeft="2px"
	style:--marginRight="5px"
	style:--marginBottom="0px">
	<!-- Chart area -->
	<svg
		class="absolute inset-0
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible">
		<svg class="overflow-hidden" viewBox={`0 0 148 74`} preserveAspectRatio="none">
			<g transform={`translate(74, 74)`}>
				{#each $series as serie, indx}
					<path
						d={serie.gauge.path}
						class="fill-slate-50 dark:fill-slate-900/40"
						vector-effect="non-scaling-stroke"
						fill="currentColor" />
					{#if serie.path}
						<path
							d={serie.path}
							transition:draw={{ duration: 800, delay: 500 * indx }}
							vector-effect="non-scaling-stroke"
							fill={serie.color} />
					{/if}
				{/each}

				<g class="legend">
					<text
						y="-5"
						class="text-2xl font-bold"
						alignment-baseline="after-edge"
						text-anchor="middle"
						fill="currentColor">
						{(data[0] / 100).toLocaleString(locale, {
							style: 'percent',
							minimumFractionDigits: 0,
						})}
					</text>
				</g>
			</g>
		</svg>
	</svg>
</div>
