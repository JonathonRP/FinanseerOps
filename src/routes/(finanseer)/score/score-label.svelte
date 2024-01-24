<svelte:options runes={true} />
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'clsx';
	import { cn } from '$lib/utils/index.svelte';

	const { children,...restProps } = $props<{ children: Snippet, class?: ClassValue }>();
</script>

<p class={cn('text-gray-401 text-base dark:text-gray-300', restProps.class)}>
	{@render children()}
</p>
