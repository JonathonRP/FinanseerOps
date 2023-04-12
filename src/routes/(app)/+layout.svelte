<script lang="ts">
	import { base } from '$app/paths';
	import MainLayout from './MainLayout.svelte';

	export let data;
	$: ({ finanseer, processedDate } = data);

	$: name = (finanseer && 'Finanseer') || 'Finanzen';

	$: preserveState = finanseer && processedDate ? `?${new URLSearchParams({ processedDate })}` : undefined;

	$: links = (processedDate && [
		{ route: `${base}/${preserveState}` },
		{ route: `${base}/transactions${preserveState}` },
		{ route: false ? `${base}/analytics${preserveState}` : '/maintenance' },
	]) || [
		{ route: `${base}/` },
		{ route: `${base}/transactions` },
		{ route: false ? `${base}/analytics` : '/maintenance' },
	];
</script>

<MainLayout {name} {links}>
	<slot />
</MainLayout>
