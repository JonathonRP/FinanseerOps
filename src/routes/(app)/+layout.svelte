<script lang="ts">
	import type { Snippet } from 'svelte';
	import MainLayout from './MainLayout.svelte';

	const { data, children }: { data: import('./$types').LayoutData; children: Snippet } = $props();

	const { user } = $derived(data);
</script>

<MainLayout {user}>
	{@render children()}
</MainLayout>
