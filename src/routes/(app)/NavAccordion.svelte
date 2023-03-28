<script lang="ts">
	import demo from '@iconify-icons/tabler/file-search';
	import chevronUp from '@iconify-icons/tabler/chevron-up';
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { accordion } from '$lib/utils';
	import { addCollection } from 'iconify-icon';
	import NavLink from './NavLink.svelte';

	export let icon = demo;
	export let routes: string[];

	addCollection({
		prefix: 'tabler',
		icons: {
			chevronUp,
		},
	});

	$: [, label] = routes[0].split('/');
</script>

<details
	class="group/menu h-[var(--collapsed)] cursor-pointer overflow-hidden transition-[height] duration-300 open:h-[var(--expanded)]"
	use:accordion>
	<summary
		class="group flex items-center justify-between divide-x-2 divide-primary-400 rounded-lg text-primary-600 transition-colors hover:bg-primary-500 hover:text-white aria-[current=page]:bg-primary-500 aria-[current=page]:text-white dark:text-neutral-309"
		aria-current={$page.url.pathname === `${base}${routes[0]}` ? 'page' : undefined}>
		<a href={routes[0]} class="flex w-full items-center space-x-2">
			<span
				aria-hidden="true"
				class="flex items-center rounded-lg p-3 transition-colors group-hover:bg-primary-600 group-hover:text-white group-aria-[current=page]:bg-primary-600 group-aria-[current=page]:text-white">
				<iconify-icon class="h-6 w-6" {icon} flip="horizontal" height="auto" />
			</span>
			<span>{label}</span>
		</a>
		<span
			aria-hidden="true"
			class="flex items-baseline px-2 text-stone-50 transition-transform group-open/menu:-scale-y-100 dark:text-stone-800">
			<iconify-icon icon={chevronUp} flip="vertical" class="h-7 w-7" height="auto" />
		</span>
	</summary>
	<ul class="mt-2 flex-1 space-y-2 overflow-hidden hover:overflow-auto">
		{#each routes.slice(1, -1) as route, i (i)}
			<li>
				<NavLink active={$page.url.pathname === `${base}${route}`} {route} />
			</li>
		{/each}
	</ul>
</details>
