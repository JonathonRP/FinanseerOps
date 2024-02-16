<script lang="ts">
	import type { Snippet } from 'svelte';
	import MainLayout from './MainLayout.svelte';

	const { data, children } = $props<{ data: import('./$types').PageData; children: Snippet }>();

	const { session } = $derived(data);
</script>

<MainLayout {session}>
	{@render children()}
</MainLayout>
