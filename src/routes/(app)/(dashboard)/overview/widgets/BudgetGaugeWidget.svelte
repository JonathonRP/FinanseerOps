<svelte:options runes={true} />

<script lang="ts">
	import { from, map } from 'rxjs';
	import { getDaysInMonth, isBefore, isSameDay, isSameMonth, getDate, startOfToday } from 'date-fns';
	import { cn } from '$/lib/utils';
	import * as d3 from 'd3';
	import { Score } from '../score';
	import { GaugeChart } from '../charts';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';
	import type { DefaultPropsType } from '.';

	const { class: className }: DefaultPropsType = $props();
	const { processedDate, transactions } = $derived($page.data);

	const processedDay = $derived((processedDate && new Date(processedDate)) || startOfToday());
	const budget = 2000;
	const percentDayOfMonth = $derived(Math.round((getDate(processedDay) / getDaysInMonth(processedDay)) * 100));

	const monthExpenseTotal = $derived(
		from(transactions).pipe(
			map((result) =>
				result
					.filter(
						({ date, type }) =>
							isSameMonth(date, processedDay) &&
							(isBefore(date, processedDay) || isSameDay(date, processedDay)) &&
							type === 'expense'
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
	class={cn(className, 'text-yellow-400 dark:text-amber-400 bg-yellow-100 dark:bg-yellow-900 shadow-yellow-50/20 dark:shadow-yellow-300/40', {
		'bg-green-100 text-green-600 shadow-green-50/20 dark:bg-green-900 dark:text-emerald-400 dark:shadow-green-300/40':
			$percentSpentOfBudget <= percentDayOfMonth,
		'bg-red-100 text-red-600 shadow-red-50/20 dark:bg-red-900 dark:text-red-300 dark:shadow-red-300/40':
			$percentSpentOfBudget > 100 - percentDayOfMonth,
	})}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Budget</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric value={budget}>
				<GaugeChart
					datasets={[
						{ main: true, data: $percentSpentOfBudget, label: 'spent of budget' },
						{ main: false, data: percentDayOfMonth, label: 'day of month' },
					].map(({ data, label, main }) => ({
						main,
						data,
						label,
						seriesColor: color(label),
					}))}
					class={($percentSpentOfBudget <= percentDayOfMonth && 'text-green-600 dark:text-emerald-400') ||
						($percentSpentOfBudget > 100 - percentDayOfMonth && 'text-red-600 dark:text-red-300')} />
			</Score.Metric>
		</Score.Content>
	</Score.Root>
</DashboardWidget>
