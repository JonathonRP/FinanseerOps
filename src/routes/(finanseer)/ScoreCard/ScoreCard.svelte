<svelte:options runes={true} />
<script lang="ts">
	import { type Snippet } from 'svelte';
	import DashboardWidget from '../DashboardWidget.svelte';
	import type { ClassValue } from 'clsx';

	const { children, ...restProps } = $props<{
		children?: Snippet,
		class?: ClassValue
	}>();'px-5 pb-12 pt-5'
</script>

<DashboardWidget class={restProps.class}>
	{#if children}
		{@render children()}
	{/if}
</DashboardWidget>