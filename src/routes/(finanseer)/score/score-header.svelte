<svelte:options runes={true} />

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'clsx';
	import { cn } from '$/lib/utils';

	const { children, ...restProps } = $props<{ children: Snippet; class?: ClassValue }>();
</script>

<dt class={cn(restProps.class)}>
	{@render children()}
</dt>
