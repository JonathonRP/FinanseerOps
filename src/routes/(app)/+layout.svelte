<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import MainLayout from './MainLayout.svelte';

	$: name = ($page.route.id?.includes('finanseer') || undefined) && 'Finanseer';

	$: preserveState = () =>
		$page.route.id?.includes('dashboards') && $page.url.searchParams.get('selectedDay') ? $page.url.search : undefined;

	$: links = ($page.route.id?.includes('finanseer') || undefined) && [
		{ route: `${true ? `${base}/` : undefined}${preserveState()}` },
		{ route: `${true ? `${base}/` : undefined}transactions${preserveState()}` },
		{ route: `${false ? `${base}/` : undefined}analytics${preserveState()}` },
	];
</script>

<MainLayout {name} {links}>
	<slot />
</MainLayout>
