<svelte:options runes={true} />

<script lang="ts">
	import type { ForwardMotionProps } from '$lib/animations';
	import { filter, from, reduce, switchMap } from 'rxjs';
	import { isSameMonth, startOfMonth, subMonths } from 'date-fns';
	import { api } from '$/lib/api';
	import { Score } from '../score';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';

	const { ...motion } = $props<ForwardMotionProps>();
	const { processedDay } = $state($page.data);

	const prevMonth = $derived(subMonths(processedDay, 1));
	const biMonthlyExpenseTotals = $derived(
		from(
			api.buxfer.transactions.query({
				startDate: startOfMonth(prevMonth),
				endDate: processedDay,
			})
		).pipe(
			switchMap((transactData) => transactData),
			filter(([{ type }]) => type === 'expense'),
			reduce(
				({ currMonthSpent, prevMonthSpent }, [{ date, amount }]) => ({
					currMonthSpent: currMonthSpent + (isSameMonth(date, processedDay) ? amount : 0),
					prevMonthSpent: prevMonthSpent + (isSameMonth(date, prevMonth) ? amount : 0),
				}),
				{ currMonthSpent: 0, prevMonthSpent: 0 }
			)
		)
	);
</script>

<DashboardWidget class="px-5 pb-12 pt-5" {motion}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Spent</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric
				value={$biMonthlyExpenseTotals.currMonthSpent}
				swap
				comparison={{ value: $biMonthlyExpenseTotals.prevMonthSpent }} />
		</Score.Content>
	</Score.Root>
</DashboardWidget>
