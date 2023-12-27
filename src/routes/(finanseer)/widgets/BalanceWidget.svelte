<svelte:options runes={true} />
<script lang="ts">
	import { from, filter, reduce } from 'rxjs';
	import { api } from '$lib/api';
	import { ScoreCard } from '../ScoreCard';

	const accounts = $derived(api.buxfer.accounts.query());

	const balance$ = $derived(from($accounts.data ?? []).pipe(
		filter(({ name }) => name.includes('1880') || name.includes('1334')),
		reduce((sum, { balance }) => sum + balance, 0)
	));
</script>

<ScoreCard.Root>
	<ScoreCard.Header>
		<ScoreCard.Label>
			Balance
		</ScoreCard.Label>
	</ScoreCard.Header>
	<ScoreCard.Content>
		<ScoreCard.Score value={$balance$} />
	</ScoreCard.Content>
</ScoreCard.Root>
