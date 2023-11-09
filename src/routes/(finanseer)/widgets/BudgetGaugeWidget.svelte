<script lang="ts">
	import { filter, switchMap, of, reduce } from 'rxjs';
	import { getDaysInMonth, startOfMonth } from 'date-fns';
	import { api } from '$lib/api';
	import GaugeChart from '../charts/GaugeChart.svelte';
	import ScoreCard from '../ScoreCard.svelte';

	export let processedDay: Date;
	export let searchFilter: string;

	const budget = 2000;
	$: monthQuarter = Math.round((processedDay.getDate() / getDaysInMonth(processedDay)) * 100);

	$: transactions = api.buxfer.transactions.infiniteQuery(
		{
			startDate: startOfMonth(processedDay),
			endDate: processedDay,
		},
		{
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
			async onSuccess(infiniteData) {
				if (infiniteData.pageParams.splice(-1)) {
					await $transactions.fetchNextPage();
				}
			},
		}
	);

	$: expenses$ = of($transactions.data).pipe(
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
	);

	$: percent = Math.round(($expenses$ / budget) * 100);
</script>

<ScoreCard
	label="Budget"
	score={budget}
	class={(percent <= monthQuarter &&
		'bg-green-100 text-green-600 shadow-green-50/20 dark:bg-green-900 dark:text-emerald-400 dark:shadow-green-300/40') ||
		(percent > 100 - monthQuarter &&
			'bg-red-100 text-red-600 shadow-red-50/20 dark:bg-red-900 dark:text-red-300 dark:shadow-red-300/40') ||
		'text-yellow-400 dark:text-amber-400'}>
	<GaugeChart
		data={[percent, monthQuarter]}
		name={[null, 'days']}
		class={(percent <= monthQuarter && 'text-green-600 dark:text-emerald-400') ||
			(percent > 100 - monthQuarter && 'text-red-600 dark:text-red-300')} />
</ScoreCard>
