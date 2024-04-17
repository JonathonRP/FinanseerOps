<script lang="ts">
	import type { Snippet } from 'svelte';
	import { twEasing } from '$/lib/animations/ease';
	import { MotionConfig } from 'svelte-motion';
	import MainLayout from './MainLayout.svelte';

	const { data, children }: { data: import('./$types').LayoutData; children: Snippet } = $props();

	const { user } = $derived(data);
</script>

<MotionConfig transition={{ ease: twEasing }}>
	<MainLayout {user}>
		{@render children()}
	</MainLayout>
</MotionConfig>
