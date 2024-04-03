<script lang="ts">
	import Preview from 'svelte-email-tailwind/preview/preview.svelte';

	export let data;
</script>

<Preview {data} email="name@example.com" />
