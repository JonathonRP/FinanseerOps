<svelte:options runes={true} />

<script lang="ts">
	import { page } from '$app/stores';
	import { cn, compareDates, compareMonths } from '$lib/utils';
	import { from, map } from 'rxjs';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { Score } from '../score';

	const { processedDay, bankTransactions } = $derived($page.data);

	const prevMonth = $derived(Temporal.PlainYearMonth.from(processedDay).subtract({ months: 1 }));
	const biMonthlyExpenseTotals = $derived(
		from(bankTransactions).pipe(
			map((data) =>
				data
					.filter(({ type }) => type === 'expense')
					.reduce(
						({ currMonthSpent, prevMonthSpent }, { date, amount }) => ({
							currMonthSpent:
								currMonthSpent +
								(compareMonths(date, processedDay) && compareDates(date, processedDay) <= 0 ? amount : 0),
							prevMonthSpent: prevMonthSpent + (compareMonths(date, prevMonth) === 0 ? amount : 0),
						}),
						{ currMonthSpent: 0, prevMonthSpent: 0 }
					)
			)
		)
	);
</script>

<DashboardWidget class={cn({ 'pb-12': false })}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Spent</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric
				value={$biMonthlyExpenseTotals?.currMonthSpent}
				swap
				comparison={{ value: $biMonthlyExpenseTotals?.prevMonthSpent }} />
		</Score.Content>
	</Score.Root>
</DashboardWidget>
