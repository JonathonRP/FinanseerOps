<svelte:options runes={true} />

<script lang="ts">
	import { accordion } from '$/lib/utils';
	import { icons, navItemIcons } from '$/icons';
	import type { ComponentType, SvelteComponent } from 'svelte';
	import { base } from '$app/paths';
	import NavLink from './NavLink.svelte';

	const navIcons = { ...navItemIcons };

	const {
		icon = navIcons.FileSearchIcon,
		routes,
		active,
	}: {
		icon?: ComponentType<SvelteComponent>;
		routes: string[];
		active: (route: string) => boolean;
	} = $props();

	const [, label] = $derived(routes[0].split('/'));
</script>

<details
	class="group/menu h-[var(--collapsed)] cursor-pointer overflow-hidden transition-[height] duration-300 open:h-[var(--expanded)]"
	use:accordion>
	<summary
		class="group flex items-center justify-between divide-x-2 divide-accent-400 rounded-lg text-accent-600 transition-colors aria-[current=page]:bg-accent-500 aria-[current=page]:text-white hover:bg-accent-500 hover:text-white dark:text-neutral-309"
		aria-current={active(`${base}${routes[0]}`) ? 'page' : undefined}>
		<a href={routes[0]} class="flex w-full items-center space-x-2">
			<span
				aria-hidden="true"
				class="flex items-center rounded-lg p-3 transition-colors group-hover:bg-accent-600 group-hover:text-white group-aria-[current=page]:bg-accent-600 group-aria-[current=page]:text-white">
				<svelte:component this={icon} class="h-6 w-6" flip="horizontal" height="auto"></svelte:component>
			</span>
			<span>{label}</span>
		</a>
		<span
			aria-hidden="true"
			class="flex items-baseline px-2 text-stone-50 transition-transform group-open/menu:-scale-y-100 dark:text-stone-800">
			<svelte:component this={icons.UpChevron} flip="vertical" class="h-7 w-7" height="auto"></svelte:component>
		</span>
	</summary>
	<ul class="mt-2 flex-1 space-y-2 overflow-hidden hover:overflow-auto">
		{#each routes.slice(1, -1) as route, i (i)}
			<li>
				<NavLink active={active(`${base}${route}`)} {route}></NavLink>
			</li>
		{/each}
	</ul>
</details>
