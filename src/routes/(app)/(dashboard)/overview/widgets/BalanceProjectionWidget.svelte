<svelte:options runes={true} />

<script lang="ts">
	import { reduce, combineLatest, from, map } from 'rxjs';
	import { Score } from '../score';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';
	import type { DefaultPropsType } from '.';
	import { today } from '$/lib/utils';

	const { class: className }: DefaultPropsType = $props();
	const { processedDate, bankAccounts, bankTransactions } = $derived($page.data);

	const processedDay = $derived(processedDate ? Temporal.PlainDate.from(processedDate) : today());
	const balance = $derived.by(() => {
		return from(bankAccounts).pipe(map((data) => data.reduce((sum, { balance }) => sum + balance, 0)));
	});

	const monthExpenseTotal = $derived(
		from(bankTransactions).pipe(
			map((data) =>
				data
					.filter(({ date, type }) => date.toPlainYearMonth() === processedDay.toPlainYearMonth() && type === 'expense')
					.reduce((acc, { amount }) => acc + amount, 0)
			)
		)
	);

	const monthIncomeTotal = $derived(
		from(bankTransactions).pipe(
			map((data) =>
				data
					.filter(({ date, type }) => date.toPlainYearMonth() === processedDay.toPlainYearMonth() && type === 'income')
					.reduce((acc, { amount }) => acc + amount, 0)
			)
		)
	);

	const forcast$ = $derived(
		combineLatest([balance, monthExpenseTotal, monthIncomeTotal]).pipe(
			reduce((acc, [bal, exp, income]) => acc + (bal + (acc - exp) + income), 0)
		)
	);
</script>

<DashboardWidget class={className}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Forecast</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric value={$forcast$}></Score.Metric>
		</Score.Content>
	</Score.Root>
</DashboardWidget>
