<svelte:options runes={true} />

<script lang="ts">
	import { twEasing } from '$/lib/animations/ease';
	import { cn } from '$/lib/utils';
	import { cubicBezier } from '$/lib/utils/cubic-bezier';
	import { Motion } from '$lib/components';
	import type { ClassValue } from 'clsx';
	import { Arc, Chart, Group, LinearGradient, Svg, Text, Tooltip } from 'layerchart';
	import { tick } from 'svelte';
	import { MotionValue } from 'svelte-motion';

	const {
		data,
		...restProps
	}: {
		data: { value: number; label: string; main: boolean; seriesColor: string }[];
		class?: ClassValue;
	} = $props();

	// Settings
	const angle = 0.5 * Math.PI;
	const radis = 74;
	const size = 24;
	const interiorRadius = radis - size;

	const innerSize = $derived(((size / data.length - 0.4) * data.length) / data.length);

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
	animate={data?.length ? { opacity: 1 } : { opacity: 0 }}
	class={cn('size-full p-4 @container', restProps.class)}>
	<Chart {data} Svg let:data={chartData} let:tooltip>
		<Svg>
			<Group center>
				{#each chartData as { value, main, label, seriesColor }, indx (label)}
					{@const padding = 5 * indx}
					{#if main}
						<LinearGradient
							stops={[seriesColor, `color-mix(in oklch, ${seriesColor} 45%, var(--tw-gradient-to))`]}
							class="to-current"
							let:url>
							<Arc
								initialValue={0}
								value={Math.min(Math.max(value, 0), 100)}
								range={[-120, 120]}
								outerRadius={interiorRadius + innerSize - padding}
								innerRadius={radis - innerSize * indx - innerSize * indx - padding}
								cornerRadius={8}
								tweened={{ duration: 800, easing: cubicBezier(...twEasing) }}
								fill={url}
								track={{ class: 'fill-muted-foreground/10 stroke-muted-foreground/10' }}
								on:pointermove={(e) => tooltip?.show(e, { value, label })}
								on:pointerleave={(e) => tooltip?.hide()}
								let:value={clampedValue}>
								<Text
									value={Math.round(clampedValue) + '%'}
									textAnchor="middle"
									verticalAnchor="middle"
									fill="currentColor"
									class="stroke-current text-3xl font-bold tabular-nums"></Text>
							</Arc>
						</LinearGradient>
					{:else}
						<Arc
							initialValue={0}
							{value}
							range={[-120, 120]}
							outerRadius={interiorRadius + innerSize - padding}
							innerRadius={radis - innerSize * indx - innerSize * indx - padding}
							cornerRadius={8}
							tweened={{ duration: 800, delay: 450 * indx, easing: cubicBezier(...twEasing) }}
							fill={seriesColor}
							track={{ class: 'fill-muted-foreground/10 stroke-muted-foreground/10' }}
							on:pointermove={(e) => tooltip?.show(e, { value, label })}
							on:pointerleave={(e) => tooltip?.hide()}>
						</Arc>
					{/if}
				{/each}
			</Group>
		</Svg>
		<Tooltip let:data x="data" y="data">
			<span class="fixed z-10 h-14 w-max rounded-lg bg-slate-500 px-2 text-foreground shadow-lg">
				<div class="mask-legend h-12 overflow-hidden scroll-smooth py-4">
					{#each chartData as dataPoint (dataPoint.label)}
						<div class="legend-item flex scroll-my-1 items-center gap-2 text-xs">
							<span class="inline-block size-4 rounded-full" style:background={dataPoint.seriesColor}></span>
							{dataPoint.label}: {dataPoint.value}%
						</div>
					{/each}
				</div>
			</span>
		</Tooltip>
	</Chart>
</Motion.div>

<!-- <Motion.span
	class="fixed -left-4 -top-5 z-10 h-14 w-max rounded-lg bg-slate-500 px-2 opacity-0 shadow-lg"
	style={{
		translateX: hoverX,
		translateY: hoverY,
		// originX: useMotionTemplate`${mousePositionX ?? useMotionValue(0)}px`,
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
			{#each data as dataPoint (dataPoint.label)}
				<div class={cn('legend-item flex scroll-my-1 items-center gap-2 text-sm')}>
					<span class="inline-block size-4" style:background={dataPoint.seriesColor}></span>
					{dataPoint.label}: {dataPoint.value}%
				</div>
			{/each}
		{/if}
	</div>
</Motion.span>

<style>
	.mask-legend {
		mask-image: linear-gradient(transparent, black 45%, black 55%, transparent 100%);
	}
</style> -->

<style>
	.mask-legend {
		mask-image: linear-gradient(transparent, black 45%, black 55%, transparent 100%);
	}
</style>
