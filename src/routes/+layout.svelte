<svelte:options runes={true} />

<script lang="ts">
	import { Motion } from '$/lib/components';
	import { NavProgress } from '$/lib/components/ui/nav-progress';
	import { navigating } from '$app/stores';
	import type { Snippet } from 'svelte';
	import { Toaster } from 'svelte-french-toast';
	import { AnimatePresence } from 'svelte-motion';
	import 'sweetalert2/src/sweetalert2.scss';
	import '../app.css';
	import './styles.css';

	const { children }: { children: Snippet } = $props();
	let progress = $state({
		reset: () => {},
	});
</script>

<AnimatePresence onExitComplete={progress?.reset} show={!!$navigating}>
	<Motion.div exit={{ opacity: 0, transition: { duration: 1 } }} class="fixed w-full">
		<NavProgress bind:this={progress}></NavProgress>
	</Motion.div>
</AnimatePresence>
<Toaster position="top-center"></Toaster>
<div data-vaul-drawer-wrapper class="app flex h-screen text-foreground md:max-h-[100dvh]">
	{@render children()}
</div>
