<svelte:options runes={true} />

<script lang="ts">
	import type { ForwardMotionProps } from '$lib/animations';
	import { filter, reduce, from, switchMap } from 'rxjs';
	import { getDaysInMonth, startOfMonth } from 'date-fns';
	import { api } from '$lib/api';
	import { Score } from '../score';
	import { GaugeChart } from '../charts';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';

	const { ...motion } = $props<ForwardMotionProps>();
	const { processedDay } = $state($page.data);

	const budget = 2000;
	const monthQuarter = $derived(Math.round((processedDay.getDate() / getDaysInMonth(processedDay)) * 100));

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

	const percent = $derived(Math.round(($monthExpenseTotal / budget) * 100));
</script>

<DashboardWidget
	class={(percent <= monthQuarter &&
		'bg-green-100 text-green-600 shadow-green-50/20 dark:bg-green-900 dark:text-emerald-400 dark:shadow-green-300/40') ||
		(percent > 100 - monthQuarter &&
			'bg-red-100 text-red-600 shadow-red-50/20 dark:bg-red-900 dark:text-red-300 dark:shadow-red-300/40') ||
		'text-yellow-400 dark:text-amber-400'}
	{motion}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Budget</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric value={budget} />
			<GaugeChart
				data={[percent, monthQuarter]}
				name={[null, 'days']}
				class={(percent <= monthQuarter && 'text-green-600 dark:text-emerald-400') ||
					(percent > 100 - monthQuarter && 'text-red-600 dark:text-red-300')} />
		</Score.Content>
	</Score.Root>
</DashboardWidget>
