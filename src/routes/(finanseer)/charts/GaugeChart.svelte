<svelte:options runes={true} />
<script lang="ts">
	import type { ClassValue } from 'clsx';
	import * as d3 from 'd3';
	import { cubicOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { derived, type Readable } from 'svelte/store';
	import { userSettings } from '$/lib/stores/userSettings.svelte';

	const {data, name, isAnimatingInitialRender = true, ...restProps} = $props<{data: number[], name?: (string | null)[], isAnimatingInitialRender?: boolean, class?: ClassValue}>()

	// Settings
	const angle = 0.5 * Math.PI;
	const radis = 74;
	const size = 24;
	const innerRadius = radis - size;
	// const outerRadius = innerRadius + size;

	const gauge = d3.arc().cornerRadius(20);

	const remaining = (percentage: number) => 100 - percentage;

	const series = derived<Readable<unknown>[], {gauge: {path: string | null}, path: string | null, color: string, centroid: [number, number]}[]>(
		data.map((value, indx) => {
			const color = d3
				.scaleOrdinal(d3.schemeTableau10)
				.domain(['0', '1'])
				.range([d3.schemeTableau10[0], d3.schemeTableau10[6]]);
			const valueStore = tweened(isAnimatingInitialRender ? 0 : value, {
				duration: 800,
				delay: 800 * (indx + 1),
				easing: cubicOut,
			});

			valueStore.set(value);

			const pie = d3
				.pie()
				.sort(null)
				.startAngle(angle * -1)
				.endAngle(angle);

			const innerSize = ((size / data.length - 0.4) * data.length) / data.length;
			const radius = radis - innerSize * indx;
			const padding = 2.5 * indx;
			const interiorRadius = radius - innerSize * indx - padding;
			const exteriorRadius = innerRadius + innerSize - padding;

			const comp = derived(valueStore, (valuestore: number) => pie([valuestore, remaining(valuestore)])[0]);

			return derived(comp, (compstore: { startAngle: number; endAngle: number; }) => ({
				gauge: {
					path: gauge({
						innerRadius: interiorRadius,
						outerRadius: exteriorRadius,
						startAngle: compstore.startAngle,
						endAngle: angle,
					}),
				},
				path: gauge({
					innerRadius: interiorRadius,
					outerRadius: exteriorRadius,
					startAngle: compstore.startAngle,
					endAngle: compstore.endAngle,
				}),
				color: color(indx.toString()),
				centroid: gauge.centroid({
					startAngle: compstore.startAngle,
					endAngle: compstore.endAngle,
					innerRadius: interiorRadius,
					outerRadius: exteriorRadius,
				}),
			}));
		}),
		(value: {gauge: {path: string | null}, path: string | null, color: string, centroid: [number, number]}) => value
	);
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
		<svg class="" viewBox={`0 0 148 74`} preserveAspectRatio="none">
			<g transform={`translate(74, 74)`}>
				{#each $series as serie, indx}
					<path
						d={serie.gauge.path}
						class="fill-slate-50 dark:fill-slate-900/40"
						vector-effect="non-scaling-stroke"
						fill="currentColor" />
					{#if serie.path}
						<!-- 							transition:draw={{ duration: 800, delay: 500 * indx }} -->
						<path d={serie.path} vector-effect="non-scaling-stroke" fill={serie.color} />
						{#if name && name[indx] && name[indx]?.length}
							<text
								class="fill-neutral-309 text-sm"
								alignment-baseline="middle"
								transform={`translate(${serie.centroid[0] - 1 * Math.sin(serie.centroid[1] - Math.PI)},${
									serie.centroid[1] - 1 * Math.sin(serie.centroid[0] - Math.PI)
								}) rotate(${
									((150 + Math.sin(serie.centroid[0])) / Math.PI) * (angle * -1) - 1 * serie.centroid[1] + Math.PI
								})`}>
								{name[indx]}
							</text>
						{/if}
					{/if}
				{/each}

				<g class="legend">
					<text
						y="-5"
						class="{restProps.class} stroke-current text-2xl font-bold"
						paint-order="stroke"
						stroke-width="0.2"
						stroke-opacity="0.5"
						alignment-baseline="after-edge"
						text-anchor="middle"
						fill="currentColor">
						{(data[0] / 100).toLocaleString(userSettings.locale, {
							style: 'percent',
							minimumFractionDigits: 0,
						})}
					</text>
				</g>
			</g>
		</svg>
	</svg>
</div>
