<svelte:options runes={true} />

<script lang="ts">
	import * as d3 from 'd3';
	import { Chart, Svg, LinearGradient, Area, Tooltip, TooltipItem, Highlight } from 'layerchart';
	import { Motion } from '$lib/components';
	import type { ClassValue } from 'clsx';
	import { tick, type Snippet } from 'svelte';
	import { MotionValue } from 'svelte-motion';
	import { twEasing } from '$/lib/animations/ease';
	import { cubicBezier } from '$/lib/utils/cubic-bezier';
	import { median, scaleBand, scaleTime } from 'd3';
	import { cn } from '$/lib/utils';

	const {
		data,
		...restProps
	}: {
		data: { date: Temporal.PlainDate; value: number }[];
		class?: ClassValue;
	} = $props();

	// Create scales
	// const yScale = d3
	// 	.scaleLinear()
	// 	.range([height, 0])
	// 	.domain([0, d3.max(data, (dataPoint: number[]) => dataPoint[1])]);
	// const xScale = d3
	// 	.scaleLinear()
	// 	.range([0, width])
	// 	.domain(d3.extent(data, (dataPoint: numebr[]) => dataPoint[0]));

	// const area = d3
	// 	.area()
	// 	.curve(d3.curveNatural)
	// 	.x((dataPoint) => xScale(dataPoint[0]))
	// 	.y0(height)
	// 	.y1((dataPoint) => yScale(dataPoint[1]));

	// const line = d3
	// 	.line()
	// 	.curve(d3.curveNatural)
	// 	.x((dataPoint) => xScale(dataPoint[0]))
	// 	.y((dataPoint) => yScale(dataPoint[1]));
</script>

<div class={cn('h-full w-full from-accent-600/50 to-accent-400/0 p-4', restProps.class)}>
	<Chart {data} x="date" xScale={scaleTime()} y="value" yDomain={[0, null]} yNice padding={{ left: 16, bottom: 24 }}>
		<Svg>
			<LinearGradient vertical let:url>
				<Area line={{ class: 'stroke-2 stroke-primary' }} fill={url} />
			</LinearGradient>
			<Highlight points lines />
		</Svg>
		<Tooltip header={(data) => Intl.DateTimeFormat(undefined, { month: 'long' }).format(data.date)} let:data>
			<TooltipItem label="value" value={data.value} />
		</Tooltip>
	</Chart>
</div>
