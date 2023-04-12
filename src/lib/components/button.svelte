<script lang="ts">
	import type { Writable } from 'svelte/store';
	import loadingIcon from '@iconify-icons/line-md/loading-loop';
	import { getContext } from 'svelte';

	export let type: 'button' | 'submit' | 'reset' | null | undefined;

	export let inline = false;
	export let loading = false;
	export let disabled = false;

	$: ({ valid, submitting } = getContext<{ valid: Writable<boolean>; submitting: Writable<boolean> }>('form') || {});
</script>

<button
	{type}
	{...$$restProps}
	on:click
	class="rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring focus:ring-primary-600 focus:ring-offset-2 disabled:bg-primary-700 dark:focus:ring-offset-neutral-808 {inline
		? 'flex-shrink-0 border-4 border-primary-500 px-2 py-1 text-sm hover:border-primary-600 disabled:border-primary-700'
		: 'w-full px-4 py-2 text-center'}"
	aria-busy={loading}
	disabled={disabled || (valid && !$valid) || loading || (submitting && $submitting)}>
	<iconify-icon icon={loadingIcon} inline class="{loading ? 'flex' : 'hidden'} w-full items-center justify-center" />
	<slot />
</button>
