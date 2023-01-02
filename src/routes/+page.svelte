<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	console.log(data.transactions)
</script>

<svelte:head>
	<title>Financial Dashboard</title>
	<meta name="description" content="Personal Finance Dashboard" />
</svelte:head>

<section>

</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>
