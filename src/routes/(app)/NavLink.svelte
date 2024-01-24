<svelte:options runes={true} />
<script lang="ts">
	import type { Snippet, SvelteComponent, ComponentType } from "svelte";
	import { navItemIcons } from "$/icons";

	const { active, icon = navItemIcons.FileSearchIcon, route, children } = $props<{ active: boolean; icon?: ComponentType<SvelteComponent>; route: string, children?: Snippet }>();
</script>

<a
	class="group relative flex w-3 items-center space-x-2 rounded-lg text-primary-600 transition-colors aria-[current=page]:bg-primary-500 aria-[current=page]:text-white hover:bg-primary-500 hover:text-white dark:text-neutral-309 md:w-full"
	aria-current={active ? 'page' : undefined}
	href={route}>
	<span
		aria-hidden="true"
		class="flex items-center rounded-lg p-3 transition-colors group-hover:bg-primary-600 group-hover:text-white group-aria-[current=page]:bg-primary-600">
		<svelte:component this={icon} class="h-6 w-6" height="auto" />
	</span>
	{#if children}
		<span class="invisible @[12rem]:visible">
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
