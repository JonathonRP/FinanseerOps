<svelte:options runes={true} />

<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';
	import './styles.css';
	import 'sweetalert2/src/sweetalert2.scss';
	import { Toaster } from 'svelte-french-toast';
	import { AnimatePresence } from 'svelte-motion';
	import { Motion } from '$/lib/components';
	import { NavProgress } from '$/lib/components/ui/nav-progress';
	import { navigating } from '$app/stores';

	const { children }: { children: Snippet } = $props();
	let progress = $state({
		reset: () => {},
	});
</script>

<AnimatePresence onExitComplete={progress?.reset} show={!!$navigating}>
	<Motion.div exit={{ opacity: 0, transition: { duration: 1 } }} class="fixed w-full">
		<NavProgress bind:this={progress} />
	</Motion.div>
</AnimatePresence>
<Toaster position="top-center" />
<div data-vaul-drawer-wrapper class="app flex min-h-[100dvh] text-foreground">
	{@render children()}
</div>
