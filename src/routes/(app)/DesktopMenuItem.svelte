<svelte:options runes={true} />

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	const {
		children,
		label,
		ariaLabel,
		onclick,
	}: { label: string; ariaLabel: string; onclick: MouseEventHandler<HTMLButtonElement>; children: Snippet } = $props();
</script>

<button
	type="button"
	{onclick}
	class="relative flex w-3 items-center space-x-2 rounded-lg opacity-80 shadow-sm transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring focus:ring-accent-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white @[5rem]:mx-4 @[5rem]:w-11/12 @[5rem]:space-x-2 md:w-full dark:shadow-neutral-600 dark:focus-visible:ring-offset-neutral-808">
	{#if children}
		{@render children()}
	{/if}
	<span class="invisible @[12rem]:visible">{label}</span>
	<span class="sr-only">{ariaLabel}</span>
</button>

<style lang="postcss">
	@media (min-width: 768px) {
		@container (max-width: 4rem) {
			button:hover > .invisible {
				left: 50px;
				opacity: 1;
				visibility: visible;
			}

			button > .invisible {
				background-color: #000;
				color: #fff;
				position: absolute;
				left: 70px;
				top: 50%;
				transform: translateY(-50%);
				padding: 10px;
				border-radius: 8px;
				opacity: 0;
				visibility: hidden;
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

				&:after {
					content: '';
					background-color: #000;
					position: absolute;
					left: -5px;
					top: 20%;
					width: 20px;
					height: 20px;
					border-radius: 4px;
					transform: rotate(45deg);
					z-index: -1;
				}
			}
		}
	}
</style>
