<svelte:options runes={true} />

<script lang="ts">
	import { navItemIcons } from '$/icons';
	import type { ComponentType, Snippet, SvelteComponent } from 'svelte';

	const {
		active,
		icon = navItemIcons.FileSearchIcon,
		route,
		children,
	}: { active: boolean; icon?: ComponentType<SvelteComponent>; route: string; children?: Snippet } = $props();
</script>

<a
	class="group aria-[current=page]:bg-accent-500 hover:bg-accent-500 relative flex w-3 items-center space-x-2 rounded-lg transition-colors hover:text-white aria-[current=page]:text-white md:w-full"
	aria-current={active ? 'page' : undefined}
	href={route}>
	<span
		aria-hidden="true"
		class="group-hover:bg-accent-600 group-aria-[current=page]:bg-accent-600 flex items-center rounded-lg p-3 transition-colors group-hover:text-white">
		<svelte:component this={icon} class="size-6" height="auto" inline />
	</span>
	{#if children}
		<span class="invisible @min-[12rem]:visible">
			{@render children()}
		</span>
	{/if}
</a>

<style lang="postcss">
	@media (min-width: 768px) {
		@container (max-width: 4rem) {
			.group:hover > span:last-of-type {
				left: 50px;
				opacity: 1;
				visibility: visible;
			}

			.group > span:last-of-type {
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
