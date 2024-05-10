<svelte:options runes={true} />

<script lang="ts">
	import { from, map } from 'rxjs';
	import { cn, today } from '$lib/utils';
	import { Score } from '../score';
	import { AreaChart } from '../charts';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';
	import type { DefaultPropsType } from '.';

	const { class: className }: DefaultPropsType = $props();
	const { processedDate, bankTransactions } = $derived($page.data);

	const processedDay = $derived(processedDate ? Temporal.PlainDate.from(processedDate) : today());
	const prevMonth = $derived(processedDay.subtract({ months: 1 }));
	const biMonthlyExpenseTotals = $derived(
		from(bankTransactions).pipe(
			map((data) =>
				data
					.filter(({ type }) => type === 'expense')
					.reduce(
						({ currMonthSpent, prevMonthSpent }, { date, amount }) => ({
							currMonthSpent:
								currMonthSpent + (date.toPlainYearMonth() === processedDay.toPlainYearMonth() ? amount : 0),
							prevMonthSpent: prevMonthSpent + (date.toPlainYearMonth() === prevMonth.toPlainYearMonth() ? amount : 0),
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
			<Score.Metric value={$biMonthlyExpenseTotals?.currMonthSpent}>
				<AreaChart
					data={[
						{ date: prevMonth, value: $biMonthlyExpenseTotals?.prevMonthSpent },
						{ date: processedDay, value: $biMonthlyExpenseTotals?.currMonthSpent },
					]} />
			</Score.Metric>
		</Score.Content>
	</Score.Root>
</DashboardWidget>
