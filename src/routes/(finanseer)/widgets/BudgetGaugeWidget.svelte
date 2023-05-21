<script lang="ts">
	import { filter, switchMap, of, reduce } from 'rxjs';
	import { getDaysInMonth, startOfMonth } from 'date-fns';
	import { api } from '$lib/api';
	import stop from '@iconify-icons/tabler/hand-stop';
	import slow from '@iconify-icons/tabler/alert-triangle';
	import good from '@iconify-icons/tabler/thumb-up';
	import GaugeChart from './GaugeChart.svelte';
	import ScoreCard from './ScoreCard.svelte';

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
			onSuccess(infiniteData) {
				if (infiniteData.pageParams.splice(-1)) {
					$transactions.fetchNextPage();
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

<ScoreCard label="Budget" score={budget}>
	<GaugeChart data={[percent, monthQuarter]} />
	<div
		class="absolute right-5 top-6 rounded-full {(percent <= monthQuarter && 'bg-green-500 dark:bg-green-800') ||
			(percent > 100 - monthQuarter && 'bg-red-500 dark:bg-red-800') ||
			'bg-yellow-400 dark:bg-amber-400'}">
		<span class="flex items-center justify-center">
			<iconify-icon
				class="h-6 w-6"
				icon={(percent <= monthQuarter && good) || (percent > 100 - monthQuarter && stop) || slow}
				inline
				height="auto" />
		</span>
	</div>
</ScoreCard>
