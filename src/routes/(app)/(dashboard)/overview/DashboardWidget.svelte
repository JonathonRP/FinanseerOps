<svelte:options runes={true} />

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'clsx';

	import { cn } from '$lib/utils/cn';

	const {
		children,
		class: className,
	}: {
		children: Snippet;
		class?: ClassValue;
	} = $props();

	// let loading = $state(true);
	// let mounting = $state(true);

	// $effect(() => {
	// 	loading = false;
	// 	mounting = false;
	// });
</script>

<dl
	class={cn(
		'bg-white dark:bg-gray-800 dark:shadow-neutral-309/20',
		className,
		'snap-center overflow-hidden rounded-xl p-5 shadow-lg'
	)}>
	{@render children()}
</dl>
