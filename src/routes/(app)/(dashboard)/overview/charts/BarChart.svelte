<svelte:options runes={true} />

<script lang="ts">
	import { Chart, Svg, LinearGradient, Bars, Axis, Rule, Highlight, Labels, Bar, Group, Text, Point } from 'layerchart';
	import type { ClassValue } from 'clsx';
	import { twEasing } from '$/lib/animations/ease';
	import { cubicBezier } from '$/lib/utils/cubic-bezier';
	import { mean, scaleBand } from 'd3';
	import { cn, numberFormat } from '$/lib/utils';

	const {
		data,
		axisFormat,
		showAverage,
		showHighlightAsRule,
		...restProps
	}: {
		data: { date?: Temporal.PlainDate; value: number; highlight: boolean; ignore: boolean }[];
		axisFormat?: any;
		showAverage?: boolean;
		showHighlightAsRule?: boolean;
		class?: ClassValue;
	} = $props();
</script>

<div class={cn(restProps.class)}>
	<Chart
		data={data.filter((d) => !d.ignore) ?? []}
		x="date"
		xScale={scaleBand().padding(0.4)}
		y="value"
		yDomain={[0, null]}
		yNice={4}
		padding={{ left: 16, bottom: 24 }}
		let:width
		let:yScale
		let:data={filteredData}>
		<Svg>
			<Axis placement="bottom" format={axisFormat} />
			<LinearGradient vertical units="userSpaceOnUse" let:url>
				<Bars
					initialY={width - 16 * 2 - 2 - 24}
					initialHeight={0}
					tweened={{
						y: { duration: 500, easing: cubicBezier(...twEasing) },
						height: { duration: 500, easing: cubicBezier(...twEasing) },
					}}
					radius={4}
					fill={url} />
			</LinearGradient>
			<Labels placement="outside" format={(d) => (d > 0 ? numberFormat().format(d) : '')} />
			{#if showAverage}
				{@const avg = mean(filteredData, (d) => d.value)}
				<Rule
					y={avg}
					tweened={{
						x: { duration: 500, easing: cubicBezier(...twEasing) },
					}}
					class="stroke-red-500 stroke-1 [stroke-dasharray:1] [stroke-linecap:round] dark:stroke-red-400" />

				<Text textAnchor="end" verticalAnchor="end" x={0} y={yScale(avg)} value={'Avg.'} class="text-sm" />
				<Text
					textAnchor="start"
					verticalAnchor="middle"
					x={width}
					y={yScale(avg)}
					value={numberFormat().format(avg ?? 0)}
					class="text-sm tabular-nums" />
			{/if}
			{#if showHighlightAsRule}
				{@const highlight = data.find((d) => d.highlight)?.value}
				<Rule
					y={highlight}
					class="stroke-slate-500 stroke-1 [stroke-dasharray:1] [stroke-linecap:round] dark:stroke-slate-400 " />
				<Text textAnchor="end" verticalAnchor="end" x={0} y={yScale(highlight)} value={'Avg.'} class="text-sm" />
				<Text
					textAnchor="start"
					verticalAnchor="middle"
					x={width}
					y={yScale(highlight)}
					value={numberFormat().format(highlight ?? 0)}
					class="text-sm tabular-nums" />
			{/if}
		</Svg>
	</Chart>
</div>
