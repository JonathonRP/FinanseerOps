<svelte:options runes={true} />

<script lang="ts">
	import { cn } from '$/lib/utils';
	import type { ClassValue } from 'clsx';
	import { scaleTime } from 'd3-scale';
	import { Area, Chart, Highlight, LinearGradient, Svg, Tooltip, TooltipItem } from 'layerchart';

	const {
		data,
		...restProps
	}: {
		data: { date: Temporal.PlainDate; value: number }[];
		class?: ClassValue;
	} = $props();
</script>

<div class={cn('size-full from-accent-600/50 to-accent-400/0 p-4', restProps.class)}>
	<Chart
		data={data ?? []}
		x={(d) => d.date.toString()}
		xScale={scaleTime()}
		y="value"
		yDomain={[0, null]}
		yNice
		padding={{ left: 16, bottom: 24 }}>
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
