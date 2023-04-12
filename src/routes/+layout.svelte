<script lang="ts">
	import '../app.css';
	import './styles.css';
	import 'sweetalert2/src/sweetalert2.scss';
	import { Toaster } from 'svelte-french-toast';

	import { addIcon } from 'iconify-icon';
	import icon from '@iconify-icons/tabler/2fa.js';

	addIcon('2fa', icon);
</script>

<Toaster position="top-right" />
<div class="app flex h-screen max-h-[100dvh] dark:text-neutral-309">
	<slot />
</div>
