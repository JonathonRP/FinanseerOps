<script lang="ts">
	import { icons } from '$/icons';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { elasticInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { cn } from '../utils';

	const { redirectReason, ...props }: { redirectReason: Promise<string | undefined>; class?: string } = $props();
</script>

{#await redirectReason then reason}
	<div
		class={cn('py-4 text-center md:px-4', props.class)}
		transition:slide={{ delay: 250, duration: 1500, easing: elasticInOut, axis: 'y' }}>
		{#if reason}
			<div class="flex items-center rounded-full bg-accent-800 p-2 leading-none text-accent-100" role="alert">
				<span class="mr-3 flex rounded-full bg-accent-500 px-1 py-1 text-xs font-bold uppercase">
					<svelte:component this={icons.InfoIcon} class="size-6" height="auto" inline></svelte:component>
				</span>
				<span class="mr-2 flex-auto text-left font-semibold">{reason}</span>
				<button
					type="button"
					class="hover:text-white"
					onclick={async () => {
						$page.url.searchParams.delete('reason');
						await goto($page.url.search, {
							keepFocus: true,
							noScroll: true,
							replaceState: true,
						});
					}}>
					<svelte:component this={icons.CloseIcon} class="mr-1 size-4" height="auto" inline />
				</button>
			</div>
		{/if}
	</div>
{/await}
