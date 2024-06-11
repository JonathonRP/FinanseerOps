<svelte:options runes={true} />

<script lang="ts">
	import { compareDates, compareMonths } from '$/lib/utils';
	import { page } from '$app/stores';
	import { userSettings } from '$lib/stores/userSettings.svelte';
	import { scaleOrdinal } from 'd3-scale';
	import { schemeTableau10 } from 'd3-scale-chromatic';
	import { combineLatest, from, map, of } from 'rxjs';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { GaugeChart } from '../charts';
	import { Score } from '../score';

	const { processedDay, bankTransactions } = $derived($page.data);

	const budget = $derived(userSettings.budget);
	const processedDate = $derived(Temporal.PlainDate.from(processedDay));
	const percentDayOfMonth = $derived(Math.round((processedDate.day / processedDate.daysInMonth) * 100));

	const monthExpenseTotal = $derived(
		from(bankTransactions).pipe(
			map((result) =>
				result
					.filter(
						({ date, type }) =>
							compareMonths(date, processedDay) === 0 && compareDates(date, processedDay) <= 0 && type === 'expense'
					)
					.reduce((acc, { amount }) => acc + amount, 0)
			)
		)
	);

	const percentSpentOfBudget = $derived(
		monthExpenseTotal.pipe(map((expenseTotal) => Math.round((expenseTotal / budget) * 100)))
	);

	const data$ = $derived(
		combineLatest([percentSpentOfBudget, of(percentDayOfMonth)]).pipe(
			map((budgetData) => {
				// [
				// 	{ main: true, value: percentSpentOfBudget$, label: 'spent of budget' },
				// 	{ main: false, value: percentDayOfMonth$, label: 'day of month' },
				// ]
				const color = scaleOrdinal(schemeTableau10)
					.domain(budgetData.map((_, indx) => indx))
					.range([schemeTableau10[0], schemeTableau10[6]]);
				return budgetData.map((value, indx) => ({
					main: indx === 0,
					value,
					label: indx === 0 ? 'spent of budget' : 'day of month',
					seriesColor: color(indx),
				}));
			})
		)
	);
</script>

<DashboardWidget
	variant={$percentSpentOfBudget <= percentDayOfMonth
		? 'success'
		: $percentSpentOfBudget > 100 - percentDayOfMonth
			? 'danger'
			: 'warning'}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Budget</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric value={budget}>
				<GaugeChart data={$data$} />
			</Score.Metric>
		</Score.Content>
	</Score.Root>
</DashboardWidget>
