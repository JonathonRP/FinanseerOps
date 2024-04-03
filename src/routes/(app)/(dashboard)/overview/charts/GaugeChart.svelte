<svelte:options runes={true} />

<script lang="ts">
	import { useTransform } from '$/lib/components/Reorder/utils';
	import { Motion } from '$lib/components';
	import { cn } from '$lib/utils';
	import type { ClassValue } from 'clsx';
	import * as d3 from 'd3';
	import { tick } from 'svelte';
	import { MotionValue, useMotionTemplate, useMotionValue } from 'svelte-motion';

	const {
		datasets,
		...restProps
	}: {
		datasets: { data: number; label: string; main: boolean; seriesColor: string }[];
		class?: ClassValue;
	} = $props();

	// Settings
	const angle = 0.5 * Math.PI;
	const radis = 74;
	const size = 24;
	const interiorRadius = radis - size;
	// const outerRadius = innerRadius + size;

	const meterGauge = d3
		.arc()
		.startAngle(angle * -1)
		.cornerRadius(20);

	const pie = d3
		.pie()
		.sort(null)
		.startAngle(angle * -1)
		.endAngle(angle);

	const innerSize = $derived(((size / datasets.length - 0.4) * datasets.length) / datasets.length);

	const series = $derived(
		datasets.map(({ seriesColor: color, label, data }, indx) => {
			const radius = radis - innerSize * indx;
			const padding = 2.5 * indx;
			const innerRadius = radius - innerSize * indx - padding;
			const outerRadius = interiorRadius + innerSize - padding;

			const { startAngle, endAngle } = pie([data, remaining(data)])[0];
			const needleProgress = useMotionValue(endAngle);
			needleProgress.set(endAngle);

			return {
				label,
				color,
				gauge: {
					path: meterGauge({
						startAngle,
						endAngle: angle,
						innerRadius,
						outerRadius,
					}),
				},
				needle: {
					path: useTransform(needleProgress, (needlePosition) =>
						meterGauge({
							startAngle,
							endAngle: needlePosition,
							innerRadius,
							outerRadius,
						})
					),
				},
			};
		})
	);

	let hover = $state(false);
	let mousePositionX = $state<MotionValue<number>>();
	let hoverX = $state<MotionValue<number>>();
	let hoverY = $state<number>();
	let hoverSeries = $state<string>();

	$effect.pre(() => {
		if (!hoverSeries) return;

		tick().then(() => {
			document.querySelector(`.legend-item-${hoverSeries}`)?.scrollIntoView({ block: 'center' });
		});
	});

	function remaining(percentage: number) {
		return 100 - percentage;
	}
</script>

<Motion.div
	initial={{ opacity: 0 }}
	animate={{ opacity: 1 }}
	class="relative h-full w-full touch-none select-none opacity-0 @container [--marginX:3px] [--marginY:0px]">
	<!-- Chart area -->
	<svg
		class="absolute inset-0
          h-[calc(100%-var(--marginTop,var(--marginY,0))-var(--marginBottom,var(--marginY,0)))]
          w-[calc(100%-var(--marginLeft,var(--marginX,0))-var(--marginRight,var(--marginX,0)))]
          translate-x-[var(--marginLeft,var(--marginX,0))]
          translate-y-[var(--marginTop,var(--marginX,0))]
          overflow-visible"
		viewBox={`0 0 148 74`}
		preserveAspectRatio="none"
		on:pointermove={({ clientX, clientY, currentTarget }) => {
			const svgPosition = currentTarget.getBoundingClientRect();
			hoverX = useTransform(
				useMotionValue(clientX - svgPosition.left - 60),
				[svgPosition.left - clientX - 60, svgPosition.right - clientX],
				[clientX - svgPosition.left + 5, clientX - svgPosition.left - 55]
			);
			hoverY = clientY - svgPosition.top - 10;
			mousePositionX = useTransform(
				useMotionValue(clientX - svgPosition.left + 60),
				[svgPosition.left - clientX + 60, svgPosition.right - clientX],
				[clientX - svgPosition.left + 60 + 24, clientX - svgPosition.left + 24]
			);
		}}>
		<g transform={`translate(74, 74)`}>
			{#each series as { gauge: { path: gauge }, needle: { path: needle }, color, label }, indx (indx)}
				<path
					id="guage-path-{indx}"
					d={gauge}
					class="fill-slate-50 dark:fill-slate-900/40"
					vector-effect="non-scaling-stroke"
					fill="currentColor" />

				<Motion.path
					id="needle-path-{indx}"
					initial={false}
					style={{
						d: needle,
					}}
					vector-effect="non-scaling-stroke"
					fill={color}
					stroke={color}
					stroke-width="2"
					stroke-opacity="0.4"
					onpointerdown={(event) => {
						(event.target as Element).releasePointerCapture(event.pointerId)
					}}
					onHoverStart={() => {
						hover = true;
						hoverSeries = label;
					}}
					onHoverEnd={() => {
						hover = false;
						hoverSeries = undefined;
					}} />
				<!-- commented for future reuse -->
				<!-- {#if label}
					<text class="fill-neutral-808 text-xs font-bold" dx="-8">
						<textPath
							xlink:href="#needle-path-{indx}"
							alignment-baseline="hanging"
							style="text-anchor: middle;"
							startOffset="40%"
							pointer-events="none">
							{label}
						</textPath>
					</text>
				{/if} -->
			{/each}
			{#if !Number.isNaN(datasets.find((data) => data.main)?.data)}
				{@const mainMeasure = datasets.find((data) => data.main)?.data ?? 0}
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
						{(mainMeasure / 100).toLocaleString(undefined, {
							style: 'percent',
							minimumFractionDigits: 0,
						})}
					</text>
				</g>
			{/if}
		</g>
	</svg>
</Motion.div>

<Motion.span
	class="fixed -left-4 -top-5 z-10 h-14 w-max rounded-lg bg-slate-500 px-2 opacity-0 shadow-lg"
	style={{
		translateX: hoverX,
		translateY: hoverY,
		originX: useMotionTemplate`${mousePositionX ?? useMotionValue(0)}px`,
		originY: 'bottom',
	}}
	animate={{
		opacity: Number(hover),
		scaleX: Number(hover),
		scaleY: Number(hover),
		transition: {
			duration: 0.4,
			opacity: {
				duration: 0.8,
			},
		},
	}}>
	<div class="mask-legend h-12 overflow-hidden scroll-smooth py-4">
		{#if hover}
			{#each datasets as dataPoint (dataPoint.label)}
				<div class={cn('legend-item flex scroll-my-1 items-center gap-2 text-sm')}>
					<span class="inline-block h-4 w-4" style:background={dataPoint.seriesColor} />
					{dataPoint.label}: {dataPoint.data}%
				</div>
			{/each}
		{/if}
	</div>
</Motion.span>

<style>
	.mask-legend {
		mask-image: linear-gradient(transparent, black 45%, black 55%, transparent 100%);
	}
</style>
