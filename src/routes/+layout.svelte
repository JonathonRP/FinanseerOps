<svelte:options runes={true} />
<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';
	import './styles.css';
	import 'sweetalert2/src/sweetalert2.scss';
	import { Toaster } from 'svelte-french-toast';

	const { children } = $props<{children: Snippet }>();
</script>

<Toaster position="top-right" />
<div class="app flex min-h-[100dvh] dark:text-neutral-309">
	{@render children()}
</div>
