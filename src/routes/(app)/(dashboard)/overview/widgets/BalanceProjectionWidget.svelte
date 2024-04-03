<svelte:options runes={true} />

<script lang="ts">
	import { filter, reduce, combineLatest, from, switchMap, map, of, catchError } from 'rxjs';
	import { isSameMonth, startOfMonth, startOfToday } from 'date-fns';
	import { Score } from '../score';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';
	import type { DefaultPropsType } from '.';

	const { class: className }: DefaultPropsType = $props();
	const { processedDate, accounts, transactions, user } = $derived($page.data);

	const processedDay = $derived((processedDate && new Date(processedDate)) || startOfToday());
	const balance = $derived(
		from(accounts).pipe(
			map((data) =>
				data
					.filter(({ id }) => user.permittedBankAccounts?.includes(id) ?? true)
					.reduce((sum, { balance }) => sum + balance, 0)
			)
		)
	);

	const monthExpenseTotal = $derived(
		from(transactions).pipe(
			map((result) =>
				result
					.filter(({ date, type }) => isSameMonth(date, processedDay) && type === 'expense')
					.reduce((acc, { amount }) => acc + amount, 0)
			)
		)
	);

	const forcast$ = $derived(
		combineLatest([balance, monthExpenseTotal]).pipe(reduce((acc, [bal, exp]) => bal - (acc - exp), 0))
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
