<svelte:options runes={true} />

<script lang="ts">
	import type { ClassValue } from 'clsx';
	import { spring } from 'svelte/motion';
	import { cn } from '../utils';

	const { value, ...restProps }: { value: string; class?: ClassValue } = $props();

	const display_count = spring(0);
	const offset = $derived(modulo($display_count, 1));

	$effect(() => {
		display_count.set(Number(value));
	});

	function modulo(n: number, m: number) {
		return ((n % m) + m) % m;
	}
</script>

<span class={cn('counter-digits', restProps.class)} style="transform: translate(0, {100 * offset}%)">
	<p class={cn('hidden-number absolute inset-0 -z-10 h-full w-full', restProps.class)} aria-hidden="true">
		{Math.floor($display_count + 1)}
	</p>
	<p class={cn(restProps.class)}>{Math.floor($display_count)}</p>
</span>

<style>
	.hidden-number {
		top: -100%;
		user-select: none;
	}
</style>
