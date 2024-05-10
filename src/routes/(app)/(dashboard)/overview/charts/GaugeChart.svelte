<svelte:options runes={true} />

<script lang="ts">
	import { Chart, Svg, Group, LinearGradient, Arc, Text } from 'layerchart';
	import { Motion } from '$lib/components';
	import type { ClassValue } from 'clsx';
	import { tick } from 'svelte';
	import { MotionValue } from 'svelte-motion';
	import { twEasing } from '$/lib/animations/ease';
	import { cubicBezier } from '$/lib/utils/cubic-bezier';
	import { cn } from '$/lib/utils';

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
	animate={data?.find((data) => data.main)?.value ? { opacity: 1 } : { opacity: 0 }}
	class={cn('h-full w-full p-4 opacity-0 @container', restProps.class)}>
	<Chart Svg>
		<Svg viewBox="0 0 74 42">
			<Group center y={32}>
				{#each data as { value, main, label, seriesColor }, indx (label)}
					{@const padding = 3.5 * indx}
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
								let:value={clampedValue}
								tweened={{ duration: 800, easing: cubicBezier(...twEasing) }}
								fill={url}
								track={{ class: 'fill-gray-900/10 dark:fill-zinc-100/10' }}>
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
							track={{ class: 'fill-gray-900/10 dark:fill-zinc-100/10' }}>
						</Arc>
					{/if}
				{/each}
			</Group>
		</Svg>
	</Chart>
</Motion.div>
