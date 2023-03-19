<script lang="ts">
	import demo from '@iconify-icons/tabler/file-search';

	export let active: boolean;
	export let icon = demo;
	export let route: string;

	$: [base, page] = route.split('/');
</script>

<a
	class="group flex w-full items-center space-x-2 rounded-lg text-primary-600 transition-colors hover:bg-primary-500 hover:text-white aria-[current=page]:bg-primary-500 aria-[current=page]:text-white dark:text-neutral-309"
	aria-current={active ? 'page' : undefined}
	href={base ?? null ? route : '#'}>
	<span
		aria-hidden="true"
		class="flex items-center rounded-lg p-3 transition-colors group-hover:bg-primary-600 group-hover:text-white group-aria-[current=page]:bg-primary-600">
		<iconify-icon class="h-6 w-6" {icon} height="auto" />
	</span>
	<span>{page || route}</span>
</a>
