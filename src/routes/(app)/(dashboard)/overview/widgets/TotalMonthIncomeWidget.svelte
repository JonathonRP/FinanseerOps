<svelte:options runes={true} />

<script lang="ts">
	import { from, map } from 'rxjs';
	import { cn, today } from '$lib/utils';
	import { Score } from '../score';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';
	import type { DefaultPropsType } from '.';

	const { class: className }: DefaultPropsType = $props();
	const { processedDate, bankTransactions } = $derived($page.data);

	const processedDay = $derived(processedDate ? Temporal.PlainDate.from(processedDate) : today());
	const prevMonth = $derived(processedDay.subtract({ months: 1 }));
	const biMonthlyIncomeTotals = $derived(
		from(bankTransactions).pipe(
			map((data) =>
				data
					.filter(({ type }) => type === 'income')
					.reduce(
						({ currMonthIncome, prevMonthIncome }, { date, amount }) => ({
							currMonthIncome:
								currMonthIncome +
								(date.toPlainYearMonth() === processedDay.toPlainYearMonth() && date <= processedDay ? amount : 0),
							prevMonthIncome:
								prevMonthIncome + (date.toPlainYearMonth() === prevMonth.toPlainYearMonth() ? amount : 0),
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
