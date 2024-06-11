<svelte:options runes={true} />

<script lang="ts">
	import { page } from '$app/stores';
	import { from, map } from 'rxjs';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { Score } from '../score';

	const { bankAccounts } = $derived($page.data);

	const balance = $derived.by(() => {
		return from(bankAccounts).pipe(map((data) => data.reduce((sum, { balance }) => sum + balance, 0)));
	});
</script>

<DashboardWidget>
	<Score.Root>
		<Score.Header>
			<Score.Label>Balance</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric value={$balance}></Score.Metric>
		</Score.Content>
	</Score.Root>
</DashboardWidget>
