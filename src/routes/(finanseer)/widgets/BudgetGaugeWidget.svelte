<script lang="ts">
	import { filter, switchMap, of, reduce } from 'rxjs';
	import { addDays, getDaysInMonth, startOfMonth } from 'date-fns';
	import { api } from '$lib/api';

	import GaugeChart from './GaugeChart.svelte';
	import ScoreCard from './ScoreCard.svelte';

	export let processedDay: Date;

	const budget = 2000;
	const monthQuerter = Math.round((processedDay.getDate() / getDaysInMonth(processedDay)) * 100);

	$: transactions = api.buxfer.transactions.infiniteQuery(
		{
			startDate: addDays(startOfMonth(processedDay), 1),
			endDate: addDays(processedDay, 1),
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
		filter(({ type }) => type === 'expense'),
		reduce((acc, { amount }) => acc + amount, 0)
	);
</script>

<ScoreCard label="Budget">
	<GaugeChart data={[$expenses$, budget, monthQuerter]} width={148} />
</ScoreCard>
