<script lang="ts">
	import type { Snippet } from 'svelte';
	import MainLayout from './MainLayout.svelte';

	const { children } = $props<{children: Snippet }>();
</script>

<MainLayout>
	{@render children()}
</MainLayout>
