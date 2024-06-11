<svelte:options runes={true} />

<script lang="ts">
	import { twEasing } from '$/lib/animations/ease';
	import { cn, numberFormat } from '$/lib/utils';
	import { cubicBezier } from '$/lib/utils/cubic-bezier';
	import type { ClassValue } from 'clsx';
	import { mean } from 'd3-array';
	import { scaleBand } from 'd3-scale';
	import { Axis, Bars, Chart, Labels, LinearGradient, Rule, Svg, Text } from 'layerchart';

	const {
		data,
		x,
		tickFormat,
		showAverage,
		showHighlightAsRule,
		...restProps
	}: {
		data: { date?: Temporal.PlainDate; value: number; highlight: boolean; ignore: boolean; label: string }[];
		x?: Chart['$$prop_def']['x'];
		tickFormat?: Axis['$$prop_def']['format'];
		showAverage?: boolean;
		showHighlightAsRule?: boolean;
		class?: ClassValue;
	} = $props();
</script>

<div class={cn(restProps.class)}>
	<Chart
		data={data.filter((d) => !d.ignore) ?? []}
		{x}
		xScale={scaleBand().padding(0.4)}
		y="value"
		yDomain={[0, null]}
		yNice={4}
		padding={{ left: 16, bottom: 24 }}
		let:width
		let:yScale
		let:data={filteredData}>
		<Svg>
			<Axis placement="bottom" format={tickFormat} />
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
				{@const highlight = data.find((d) => d.highlight)}
				<Rule
					y={highlight?.value}
					class="stroke-slate-500 stroke-1 [stroke-dasharray:1] [stroke-linecap:round] dark:stroke-slate-400 " />
				<Text
					textAnchor="end"
					verticalAnchor="end"
					x={0}
					y={yScale(highlight?.value)}
					value={highlight?.label}
					class="text-sm" />
				<Text
					textAnchor="start"
					verticalAnchor="middle"
					x={width}
					y={yScale(highlight?.value)}
					value={numberFormat().format(highlight?.value ?? 0)}
					class="text-sm tabular-nums" />
			{/if}
		</Svg>
	</Chart>
</div>
