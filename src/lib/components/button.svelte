<script lang="ts">
	import loadingIcon from '@iconify-icons/line-md/loading-loop';

	export let inline = false;
	export let loading = false;
	export let disable = false;
</script>

<button
	{...$$restProps}
	class="rounded-lg bg-primary-500 text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring focus:ring-primary-600 focus:ring-offset-2 dark:focus:ring-offset-neutral-808 {inline
		? 'flex-shrink-0 border-4 border-primary-500 py-1 px-2 text-sm hover:border-primary-600'
		: 'w-full px-4 py-2 text-center'}"
	disabled={disable || loading}>
	{#if loading}
		<iconify-icon icon={loadingIcon} inline class="flex w-full items-center justify-center" />
	{:else}
		<slot />
	{/if}
</button>
