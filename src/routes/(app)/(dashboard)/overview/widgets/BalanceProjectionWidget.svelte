<svelte:options runes={true} />

<script lang="ts">
	import { reduce, combineLatest, from, map } from 'rxjs';
	import { isSameMonth, startOfToday } from 'date-fns';
	import { Score } from '../score';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';
	import type { DefaultPropsType } from '.';

	const { class: className }: DefaultPropsType = $props();
	const { processedDate, accounts, transactions, user } = $derived($page.data);

	const processedDay = $derived((processedDate && new Date(processedDate)) || startOfToday());
	const balance = $derived.by(() => {
		const filter = user.permittedBankAccounts;
		return from(accounts).pipe(
			map((data) =>
				data.filter(({ id }) => filter?.includes(id) ?? true).reduce((sum, { balance }) => sum + balance, 0)
			)
		);
	});

	const monthExpenseTotal = $derived(
		from(transactions).pipe(
			map((data) =>
				data
					.filter(({ date, type }) => isSameMonth(date, processedDay) && type === 'expense')
					.reduce((acc, { amount }) => acc + amount, 0)
			)
		)
	);

	const monthIncomeTotal = $derived(
		from(transactions).pipe(
			map((data) =>
				data
					.filter(({ date, type }) => isSameMonth(date, processedDay) && type === 'income')
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
			<Score.Metric value={$forcast$} />
		</Score.Content>
	</Score.Root>
</DashboardWidget>
