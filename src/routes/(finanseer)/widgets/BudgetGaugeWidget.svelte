<svelte:options runes={true} />
<script lang="ts">
	import type { ForwardMotionProps } from '$lib/animations'
	import { filter, switchMap, of, reduce } from 'rxjs';
	import { getDaysInMonth, startOfMonth } from 'date-fns';
	import { api } from '$lib/api';
	import { Score } from '../score';
	import { GaugeChart } from '../charts';
	import DashboardWidget from '../DashboardWidget.svelte';

	const { processedDay, searchFilter, ...motion } = $props<{processedDay: Date, searchFilter: string} & ForwardMotionProps>();

	const budget = 2000;
	const monthQuarter = $derived(Math.round((processedDay.getDate() / getDaysInMonth(processedDay)) * 100));

	const transactions = $derived(api.buxfer.transactions.infiniteQuery(
		{
			startDate: startOfMonth(processedDay),
			endDate: processedDay,
		},
		{
			initialPageParam: 1,
			getNextPageParam: (lastPage, allPages) => {
				if (
					lastPage &&
					typeof lastPage === 'object' &&
					'totalTransactionsCount' in lastPage &&
					typeof lastPage.totalTransactionsCount === 'number' &&
					allPages.length < Math.ceil(lastPage.totalTransactionsCount / 100)
				) {
					return allPages.length + 1;
				}
				return undefined;
			},
		}
	));

	const expenses$ = $derived(of($transactions.data).pipe(
		switchMap((data) => data?.pages.flatMap((page) => page.transactions) ?? []),
		filter(({ type, tags, description }) =>
			searchFilter
				? type.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null ||
				  tags.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null ||
				  description.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null
				: true
		),
		filter(({ type }) => type === 'expense'),
		reduce((acc, { amount }) => acc + amount, 0)
	));

	const percent = $derived(Math.round(($expenses$ / budget) * 100));

	$effect(() => {
		if ($transactions.status === 'success' && $transactions.hasNextPage) {
			$transactions.fetchNextPage();
		}
	});
</script>

<DashboardWidget class={(percent <= monthQuarter &&
		'bg-green-100 text-green-600 shadow-green-50/20 dark:bg-green-900 dark:text-emerald-400 dark:shadow-green-300/40') ||
		(percent > 100 - monthQuarter &&
			'bg-red-100 text-red-600 shadow-red-50/20 dark:bg-red-900 dark:text-red-300 dark:shadow-red-300/40') ||
		'text-yellow-400 dark:text-amber-400'} {motion}>
	<Score.Root>
		<Score.Header>
			<Score.Label>
				Budget
			</Score.Label>
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