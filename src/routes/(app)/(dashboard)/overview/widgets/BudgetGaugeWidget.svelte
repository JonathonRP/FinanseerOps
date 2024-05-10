<svelte:options runes={true} />

<script lang="ts">
	import { from, map } from 'rxjs';
	import { cn, today } from '$/lib/utils';
	import * as d3 from 'd3';
	import { Score } from '../score';
	import { GaugeChart } from '../charts';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';
	import type { DefaultPropsType } from '.';
	import { userSettings } from '$lib/stores/userSettings.svelte';

	const { class: className }: DefaultPropsType = $props();
	const { processedDate, bankTransactions } = $derived($page.data);

	const processedDay = $derived(processedDate ? Temporal.PlainDate.from(processedDate) : today());
	const budget = $derived(userSettings.budget);
	const percentDayOfMonth = $derived(Math.round((processedDay.day / processedDay.daysInMonth) * 100));

	const monthExpenseTotal = $derived(
		from(bankTransactions).pipe(
			map((result) =>
				result
					.filter(
						({ date, type }) =>
							date.toPlainYearMonth() === processedDay.toPlainYearMonth() && date <= processedDay && type === 'expense'
					)
					.reduce((acc, { amount }) => acc + amount, 0)
			)
		)
	);

	const percentSpentOfBudget = $derived(
		monthExpenseTotal.pipe(map((expenseTotal) => Math.round((expenseTotal / budget) * 100)))
	);

	const color = d3
		.scaleOrdinal(d3.schemeTableau10)
		.domain(['expense of budget', 'day out of days in month'])
		.range([d3.schemeTableau10[0], d3.schemeTableau10[6]]);
</script>

<DashboardWidget
	class={cn(
		className,
		'bg-yellow-100 text-yellow-400 shadow-yellow-50/20 dark:bg-yellow-900 dark:text-amber-400 dark:shadow-yellow-300/40',
		{
			'bg-green-100 text-green-600 shadow-green-50/20 dark:bg-green-900 dark:text-emerald-400 dark:shadow-green-300/40':
				$percentSpentOfBudget <= percentDayOfMonth,
			'bg-red-100 text-red-600 shadow-red-50/20 dark:bg-red-900 dark:text-red-300 dark:shadow-red-300/40':
				$percentSpentOfBudget > 100 - percentDayOfMonth,
		}
	)}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Budget</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric value={budget}>
				<GaugeChart
					data={[
						{ main: true, value: $percentSpentOfBudget, label: 'spent of budget' },
						{ main: false, value: percentDayOfMonth, label: 'day of month' },
					].map(({ value, label, main }) => ({
						main,
						value,
						label,
						seriesColor: color(label),
					}))}
					class={($percentSpentOfBudget <= percentDayOfMonth && 'text-green-600 dark:text-emerald-400') ||
						($percentSpentOfBudget > 100 - percentDayOfMonth && 'text-red-600 dark:text-red-300')} />
			</Score.Metric>
		</Score.Content>
	</Score.Root>
</DashboardWidget>
