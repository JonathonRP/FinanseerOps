<script lang="ts">
	import '../app.css';
	import './styles.css';
	import 'sweetalert2/src/sweetalert2.scss';
	import { Toaster } from 'svelte-french-toast';
</script>

<Toaster position="top-right" />
<div class="app flex h-screen max-h-[100dvh] dark:text-neutral-309">
	<slot />
</div>
