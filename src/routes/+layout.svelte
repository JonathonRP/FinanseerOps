<svelte:options runes={true} />
<script lang="ts">
	import '../app.css';
	import './styles.css';
	import 'sweetalert2/src/sweetalert2.scss';
	import { Toaster } from 'svelte-french-toast';

	import { api } from '$lib/api';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import type { PageData } from './(finanseer)/$types';

	const { data } = $props<{data: PageData}>();
	const queryClient = $derived(api.hydrateFromServer(data.api));
</script>

<Toaster position="top-right" />
<div class="app flex min-h-[100dvh] dark:text-neutral-309">
	<QueryClientProvider client={queryClient}>
		<slot />
	</QueryClientProvider>
</div>
