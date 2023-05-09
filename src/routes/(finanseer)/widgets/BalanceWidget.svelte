<script lang="ts">
	import { from, filter, reduce } from 'rxjs';
	import { api } from '$lib/api';
	import ScoreCard from './ScoreCard.svelte';

	$: accounts = api.buxfer.accounts.query();

	$: balance$ = from($accounts.data ?? []).pipe(
		filter(({ name }) => name.includes('1880') || name.includes('1334')),
		reduce((sum, { balance }) => sum + balance, 0)
	);
</script>

<ScoreCard label="Balance" score={$balance$} />
