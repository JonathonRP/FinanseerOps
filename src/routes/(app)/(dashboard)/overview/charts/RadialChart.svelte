<svelte:options runes={true} />

<script lang="ts">
	import { twEasing } from '$/lib/animations/ease';
	import { cn } from '$/lib/utils';
	import { cubicBezier } from '$/lib/utils/cubic-bezier';
	import { Motion } from '$lib/components';
	import type { ClassValue } from 'clsx';
	import { scaleOrdinal } from 'd3-scale';
	import { Arc, Chart, Group, Legend, LinearGradient, Svg } from 'layerchart';

	const {
		data,
		...restProps
	}: {
		data: { value: number; label: string; seriesColor: string }[];
		class?: ClassValue;
	} = $props();
</script>

<Motion.div
	initial={{ opacity: 0 }}
	animate={data?.length ? { opacity: 1 } : { opacity: 0 }}
	class={cn('size-full pb-8 pl-4 pt-4 @container', restProps.class)}>
	<Chart data={data?.toSorted((a, b) => b.value - a.value)} Svg let:height let:width let:data={chartData} let:tooltip>
		{@const spacing = 16}
		<Svg>
			<Group transform="translate({width > 250 ? width / 4 - spacing : 0}, {height / 2})">
				{#each chartData as { value, label, seriesColor }, indx (label)}
					<!-- Settings -->
					{@const radius =
						Math.round(Math.floor(Math.min(width, height) / chartData?.filter((d) => d.value > 0).length)) / 4}
					{@const padding = 3}
					{@const { outerRadius, innerRadius } = {
						outerRadius: indx > 0 ? (radius * -1 - padding) * indx : undefined,
						innerRadius: radius * -1,
					}}
					<LinearGradient
						class="from-foreground"
						stops={[`color-mix(in srgb, ${seriesColor} 65%, var(--tw-gradient-from)`, seriesColor]}
						let:url>
						<Arc
							initialValue={0}
							{value}
							{outerRadius}
							{innerRadius}
							domain={[0, 100]}
							cornerRadius={10}
							tweened={{ duration: 800, delay: 450 * indx, easing: cubicBezier(...twEasing) }}
							class="shadow-lg"
							fill={url}
							track={{
								style: `fill: color-mix(in oklch, ${seriesColor} 10%, transparent)`,
							}}
							on:pointermove={(e) => tooltip?.show(e, { value, label, seriesColor })}
							on:pointerleave={(e) => tooltip?.hide()}>
						</Arc>
					</LinearGradient>
				{/each}
			</Group>
		</Svg>
		<!-- <Tooltip let:data>
			<Legend
				scale={scaleOrdinal(
					chartData?.map((d) => d.label),
					chartData?.map((d) => d.seriesColor)
				)}
				placement="center"
				class="fixed z-10 hidden h-16 w-48 rounded-lg bg-slate-500 px-2 text-foreground shadow-lg lg:block"
				let:values={labels}
				let:scale>
				<ul class="mask-legend flex h-16 flex-col gap-1 overflow-hidden scroll-smooth py-4">
					{#each labels as label, indx (label)}
						<li
							class="legend-item flex scroll-my-1 items-center gap-2 text-sm font-medium text-gray-500 dark:text-zinc-400">
							<span class="size-4 rounded-full" style:background-color={scale(label)} />
							{label}
						</li>
					{/each}
				</ul>
			</Legend>
		</Tooltip> -->
		<Legend
			scale={scaleOrdinal(
				chartData?.map((d) => d.label),
				chartData?.map((d) => d.seriesColor)
			)}
			placement="bottom-right"
			x={width / 2 + spacing}
			class="hidden lg:block"
			let:values={labels}
			let:scale>
			<ul class="flex flex-col gap-1">
				{#each labels as label, indx (label)}
					<li class="line-clamp-1 flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground/60">
						<span class="flex items-center gap-2">
							<span class="size-2 rounded-full" style:background-color={scale(label)} />
							{label}
						</span>
						{Intl.NumberFormat(undefined, {
							style: 'percent',
							minimumFractionDigits: 0,
							maximumFractionDigits: 2,
						}).format(chartData[indx]?.value / 100)}
					</li>
				{/each}
			</ul>
		</Legend>
	</Chart>
</Motion.div>

<style>
	.mask-legend {
		mask-image: linear-gradient(transparent, black 45%, black 55%, transparent 100%);
	}
</style>
