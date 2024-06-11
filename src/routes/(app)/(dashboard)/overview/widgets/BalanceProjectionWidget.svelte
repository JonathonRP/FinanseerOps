<svelte:options runes={true} />

<script lang="ts">
	import { page } from '$app/stores';
	import { compareMonths } from '$lib/utils';
	import { combineLatest, from, map, reduce } from 'rxjs';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { Score } from '../score';

	const { processedDay, bankAccounts, bankTransactions } = $derived($page.data);

	const balance = $derived.by(() => {
		return from(bankAccounts).pipe(map((data) => data.reduce((sum, { balance }) => sum + balance, 0)));
	});

	const monthTotals = $derived(
		from(bankTransactions).pipe(
			map((data) =>
				data
					.filter(({ date }) => compareMonths(date, processedDay) === 0)
					.reduce(
						({ income, expense }, { amount, type }) => ({
							income: income - (type === 'income' ? amount : 0),
							expense: expense + (type === 'expense' ? amount : 0),
						}),
						{ income: 0, expense: 0 }
					)
			)
		)
	);

	const forcast$ = $derived(
		combineLatest([balance, monthTotals]).pipe(
			reduce((acc, [bal, { expense, income }]) => acc + (bal + (acc - expense) + income), 0)
		)
	);
</script>

<DashboardWidget>
	<Score.Root>
		<Score.Header>
			<Score.Label>Forecast</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric value={$forcast$}></Score.Metric>
		</Score.Content>
	</Score.Root>
</DashboardWidget>
