<svelte:options runes={true} />

<script lang="ts">
	import { type Snippet } from 'svelte';
	import ScoreMetric from './score-metric.svelte';

	const { children } = $props<{
		children?: Snippet<[{ metric: typeof ScoreMetric }]>;
	}>();
	// 'px-5 pb-12 pt-5';
</script>

{#if children}
	{@render children({ metric: ScoreMetric })}
{/if}
