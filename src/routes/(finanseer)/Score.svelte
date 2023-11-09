<script lang="ts">
	import { fade } from 'svelte/transition';
	import { numberFormat, cn } from '$lib/utils';
	import { tweened } from 'svelte/motion';

	export let value: number | undefined | null = null;

	const value$ = tweened(0, { duration: 300 });

	$: if (value !== null && value !== undefined) {
		value$.set(value);
	}
</script>

<p
	transition:fade={{ duration: 300 }}
	class={cn('text-2xl font-bold text-gray-900 dark:text-gray-100', $$restProps.class)}>
	{numberFormat().format($value$)}
</p>
