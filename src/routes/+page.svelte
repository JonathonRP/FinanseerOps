<script lang="ts">
	import type { PageData } from './$types';
	import { transactions } from '$lib/stores/transactions';
	import { balances } from '$lib/stores/balances';
	import ScoreCard from './ScoreCard.svelte';
</script>

<svelte:head>
	<title>Financial Dashboard</title>
	<meta name="description" content="Personal Finance Dashboard" />
</svelte:head>

<section>
	{@debug $balances}
	<ScoreCard label="Balance" score={20000}></ScoreCard>	
	<ScoreCard label="Forecast" score={20000 - 2000}></ScoreCard>	
</section>

<style>
	section {
		display: flex;
		flex-direction: row;
		justify-content: center;
		column-gap: 1rem;
	}
</style>
