<svelte:options runes={true} />

<script lang="ts">
	import { filter, from, map, reduce, switchMap } from 'rxjs';
	import { isBefore, isSameDay, isSameMonth, startOfToday, subMonths } from 'date-fns';
	import { cn } from '$lib/utils';
	import { Score } from '../score';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';
	import type { DefaultPropsType } from '.';

	const { class: className }: DefaultPropsType = $props();
	const { processedDate, transactions } = $derived($page.data);

	const processedDay = $derived((processedDate && new Date(processedDate)) || startOfToday());
	const prevMonth = $derived(subMonths(processedDay, 1));
	const biMonthlyIncomeTotals = $derived(
		from(transactions).pipe(
			map((data) =>
				data
					.filter(({ type }) => type === 'income')
					.reduce(
						({ currMonthIncome, prevMonthIncome }, { date, amount }) => ({
							currMonthIncome:
								currMonthIncome +
								(isSameMonth(date, processedDay) && (isBefore(date, processedDay) || isSameDay(date, processedDay))
									? amount
									: 0),
							prevMonthIncome: prevMonthIncome + (isSameMonth(date, prevMonth) ? amount : 0),
						}),
						{ currMonthIncome: 0, prevMonthIncome: 0 }
					)
			)
		)
	);
</script>

<DashboardWidget class={cn(className, 'px-5 pb-12 pt-5')}>
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
