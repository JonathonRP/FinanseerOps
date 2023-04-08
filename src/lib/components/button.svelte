<script lang="ts">
	import type { Writable } from 'svelte/store';
	import loadingIcon from '@iconify-icons/line-md/loading-loop';
	import { getContext } from 'svelte';

	export let type: 'button' | 'submit' | 'reset' | null | undefined;

	export let inline = false;
	export let loading = false;
	export let disable = false;

	const { valid, submitting } = getContext<{ valid: Writable<boolean>; submitting: Writable<boolean> }>('form') || {};

	$: if (type === 'submit' && valid && submitting) {
		loading = $submitting;
		disable = $valid;
	}
</script>

<button
	{type}
	{...$$restProps}
	on:click
	class="rounded-lg bg-primary-500 text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring focus:ring-primary-600 focus:ring-offset-2 dark:focus:ring-offset-neutral-808 {inline
		? 'flex-shrink-0 border-4 border-primary-500 px-2 py-1 text-sm hover:border-primary-600'
		: 'w-full px-4 py-2 text-center'}"
	aria-busy={loading}
	disabled={disable || loading}>
	{#if loading}
		<iconify-icon icon={loadingIcon} inline class="flex w-full items-center justify-center" />
	{:else}
		<slot />
	{/if}
</button>
