<svelte:options runes={true} />

<script lang="ts">
	import { page } from '$app/stores';
	import { cn, compareDates, compareMonths } from '$lib/utils';
	import { from, map } from 'rxjs';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { Score } from '../score';

	const { processedDay, bankTransactions } = $derived($page.data);

	const prevMonth = $derived(
		Temporal.PlainYearMonth.from(processedDay).subtract({
			months: 1,
		})
	);
	const biMonthlyIncomeTotals = $derived(
		from(bankTransactions).pipe(
			map((data) =>
				data
					.filter(({ type }) => type === 'income')
					.reduce(
						({ currMonthIncome, prevMonthIncome }, { date, amount }) => ({
							currMonthIncome:
								currMonthIncome +
								(compareMonths(date, processedDay) && compareDates(date, processedDay) <= 0 ? amount : 0),
							prevMonthIncome: prevMonthIncome + (compareMonths(date, prevMonth) === 0 ? amount : 0),
						}),
						{ currMonthIncome: 0, prevMonthIncome: 0 }
					)
			)
		)
	);
</script>

<DashboardWidget class={cn({ 'pb-12': false })}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Income</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric
				value={$biMonthlyIncomeTotals?.currMonthIncome}
				swap
				comparison={{ value: $biMonthlyIncomeTotals?.prevMonthIncome }} />
		</Score.Content>
	</Score.Root>
</DashboardWidget>
