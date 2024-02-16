<svelte:options runes={true} />

<script lang="ts">
	import type { ForwardMotionProps } from '$lib/animations';
	import { from, filter, reduce, groupBy, combineLatest, switchMap, map, mergeMap } from 'rxjs';
	import { startOfMonth } from 'date-fns';
	import { api } from '$lib/api';
	import { Score } from '../score';
	import { GaugeChart } from '../charts';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';

	const { ...motion } = $props<ForwardMotionProps>();
	const { processedDay } = $state($page.data);

	const expenses = $derived(
		from(
			api.buxfer.transactions.query({
				startDate: startOfMonth(processedDay),
				endDate: processedDay,
			})
		).pipe(
			switchMap((transactData) => transactData),
			filter(([{ type }]) => type === 'expense')
		)
	);
	const monthExpenseTotal = $derived(expenses.pipe(reduce((acc, [{ amount }]) => acc + amount, 0)));

	const categories = $derived(
		expenses.pipe(
			groupBy(([{ tags }]) => tags),
			mergeMap((group$) => group$.pipe(reduce((acc, [cur]) => acc + cur.amount, 0)))
		)
	);

	const percentages$ = $derived(
		combineLatest([categories, monthExpenseTotal]).pipe(
			map(([categories$, monthExpenseTotal$]) => Math.round((categories$ / monthExpenseTotal$) * 100))
		)
	);
</script>

<DashboardWidget {motion}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Categories</Score.Label>
		</Score.Header>
		<Score.Content>
			<GaugeChart data={[$percentages$]} />
		</Score.Content>
	</Score.Root>
</DashboardWidget>
