<svelte:options runes={true} />

<script lang="ts">
	import { from, map } from 'rxjs';
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
	const biMonthlyExpenseTotals = $derived(
		from(transactions).pipe(
			map((data) =>
				data
					.filter(({ type }) => type === 'expense')
					.reduce(
						({ currMonthSpent, prevMonthSpent }, { date, amount }) => ({
							currMonthSpent:
								currMonthSpent +
								(isSameMonth(date, processedDay) && (isBefore(date, processedDay) || isSameDay(date, processedDay))
									? amount
									: 0),
							prevMonthSpent: prevMonthSpent + (isSameMonth(date, prevMonth) ? amount : 0),
						}),
						{ currMonthSpent: 0, prevMonthSpent: 0 }
					)
			)
		)
	);
</script>

<DashboardWidget class={cn(className, 'px-5 pb-12 pt-5')}>
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
