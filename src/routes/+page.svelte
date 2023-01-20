<script lang="ts">
	import { getTransactions } from '$lib/stores/transactions';
	import { getBalances } from '$lib/stores/balances';
	import ScoreCard from './ScoreCard.svelte';

	let currentBalance;
</script>

<svelte:head>
	<title>Financial Dashboard</title>
	<meta name="description" content="Personal Finance Dashboard" />
</svelte:head>

<section>
	<!-- 1334 -->
	<!-- 6801 -->
	<ScoreCard label="Balance" score={currentBalance = $getBalances.accounts.reduce((sum, account) => sum + (account.name.includes('1880') || account.name.includes('1334') ? account.balance : 0), 0)}></ScoreCard>	
	<ScoreCard label="Forecast" score={currentBalance - (Math.abs($getTransactions.transactions.reduce((sum, transaction) => sum + transaction.amount, 0)))}></ScoreCard>	
</section>

<style>
	section {
		display: flex;
		flex-direction: row;
		justify-content: center;
		column-gap: 1rem;
	}
</style>
