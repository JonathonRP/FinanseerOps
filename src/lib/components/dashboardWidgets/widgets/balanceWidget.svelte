<script lang="ts">
	import { from, filter, reduce, lastValueFrom } from 'rxjs';
	import { api } from '$lib/api';
	import ScoreCard from './baseScoreCard.svelte';

	export let delay: number;

	$: accounts = api.buxfer.accounts.query();

	$: balance$ = from($accounts.data ?? []).pipe(
		filter(({ name }) => name.includes('1880') || name.includes('1334')),
		reduce((sum, { balance }) => sum + balance, 0)
	);
</script>

{#await lastValueFrom(balance$)}
	<ScoreCard label="Balance" score={undefined} {delay} />
{:then balance}
	<ScoreCard label="Balance" score={balance} />
{/await}
