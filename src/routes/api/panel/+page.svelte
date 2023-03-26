<script lang="ts">
	import { renderTrpcPanel } from 'trpc-panel';
	import { appRouter } from '$lib/server/api';
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html renderTrpcPanel(appRouter, {
	url: `${origin}/api/trpc`,
	transformer: 'superjson',
})}
