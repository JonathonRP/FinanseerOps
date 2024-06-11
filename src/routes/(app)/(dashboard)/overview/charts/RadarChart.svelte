<svelte:options runes={true} />

<script lang="ts">
	import { cn } from '$lib/utils';
	import type { ClassValue } from 'clsx';
	import { scaleBand } from 'd3-scale';
	import { curveCatmullRomClosed } from 'd3-shape';
	import { Axis, Chart, Group, Points, Spline, Svg } from 'layerchart';

	const {
		data,
		...restProps
	}: {
		data: { value: number; label: string; seriesColor: string }[];
		class?: ClassValue;
	} = $props();

	const curve = curveCatmullRomClosed;
</script>

<div class={cn('size-full @container lg:p-2', restProps.class)}>
	<Chart
		data={data?.toSorted((a, b) => b.value - a.value) ?? []}
		x="label"
		xScale={scaleBand()}
		xDomain={data?.toSorted((a, b) => b.value - a.value).map((d) => d.label)}
		xRange={[0, 2 * Math.PI]}
		y="value"
		yRange={({ height }) => [15, height / 2]}
		yPadding={[0, 10]}
		padding={{ top: 16, bottom: 32 }}>
		<Svg>
			<Group center>
				<Axis
					placement="radius"
					grid={{ class: 'stroke-muted-foreground/20 fill-muted/20' }}
					rule
					format={(d) => d + '%'} />
				<Axis placement="angle" grid={{ class: 'stroke-muted-foreground/20' }} />
				<Spline radial {curve} class="fill-accent-400/20 stroke-accent-500" />
				<Points radial class="fill-accent-500 stroke-muted" />
			</Group>
		</Svg>
	</Chart>
</div>
