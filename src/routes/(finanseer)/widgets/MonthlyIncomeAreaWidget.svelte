<svelte:options runes={true} />

<script lang="ts">
	import type { ForwardMotionProps } from '$lib/animations';
	import { filter, from, reduce, switchMap } from 'rxjs';
	import { format, isSameMonth, startOfMonth, subMonths } from 'date-fns';
	import { dateFormat } from '$/lib/utils';
	import { api } from '$lib/api';
	import { Score } from '../score';
	import { AreaChart } from '../charts';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';

	const { ...motion } = $props<ForwardMotionProps>();
	const { processedDay } = $state($page.data);

	const prevMonth = $derived(subMonths(processedDay, 1));
	const biMonthlyIncomeTotals = $derived(
		from(
			api.buxfer.transactions.query({
				startDate: startOfMonth(prevMonth),
				endDate: processedDay,
			})
		).pipe(
			switchMap((transactData) => transactData),
			filter(([{ type }]) => type === 'income'),
			reduce(
				({ currMonthIncome, prevMonthIncome }, [{ date, amount }]) => ({
					currMonthIncome: currMonthIncome + (isSameMonth(date, processedDay) ? amount : 0),
					prevMonthIncome: prevMonthIncome + (isSameMonth(date, prevMonth) ? amount : 0),
				}),
				{ currMonthIncome: 0, prevMonthIncome: 0 }
			)
		)
	);

	const processedDate = $derived(format(processedDay, dateFormat));

	const data = [
		{
			year: 2000,
			popularity: 50,
		},
		{
			year: 2001,
			popularity: 150,
		},
		{
			year: 2002,
			popularity: 200,
		},
		{
			year: 2003,
			popularity: 130,
		},
		{
			year: 2004,
			popularity: 240,
		},
		{
			year: 2005,
			popularity: 380,
		},
		{
			year: 2006,
			popularity: 420,
		},
	];
</script>

<DashboardWidget class="px-5 pb-12 pt-5" {motion}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Income</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric
				value={$biMonthlyIncomeTotals.currMonthIncome}
				swap
				comparison={{ value: $biMonthlyIncomeTotals.prevMonthIncome }} />
			<AreaChart data={data.flatMap(Object.values)} />
		</Score.Content>
	</Score.Root>
</DashboardWidget>
