<svelte:options runes={true} />

<script lang="ts">
	import type { ForwardMotionProps } from '$lib/animations';
	import { filter, reduce, combineLatest, from, switchMap } from 'rxjs';
	import { api } from '$lib/api';
	import { startOfMonth } from 'date-fns';
	import { Score } from '../score';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';

	const { ...motion } = $props<ForwardMotionProps>();
	const { processedDay } = $state($page.data);

	const balance = $derived(
		from(api.buxfer.accounts.query()).pipe(
			switchMap((accountData) => accountData),
			filter(([{ name }]) => name.includes('1880') || name.includes('1334')),
			reduce((sum, [{ balance }]) => sum + balance, 0)
		)
	);

	const monthExpenseTotal = $derived(
		from(
			api.buxfer.transactions.query({
				startDate: startOfMonth(processedDay),
				endDate: processedDay,
			})
		).pipe(
			switchMap((transactData) => transactData),
			filter(([{ type }]) => type === 'expense'),
			reduce((acc, [{ amount }]) => acc + amount, 0)
		)
	);

	const forcast$ = $derived(
		combineLatest([balance, monthExpenseTotal]).pipe(reduce((acc, [bal, exp]) => bal - exp, 0))
	);
</script>

<DashboardWidget {motion}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Forecast</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric value={$forcast$} />
		</Score.Content>
	</Score.Root>
</DashboardWidget>
