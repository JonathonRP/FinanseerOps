<script lang="ts">
	import { filter, switchMap, of, reduce, groupBy, combineLatest, map, mergeMap } from 'rxjs';
	import { startOfMonth } from 'date-fns';
	import { api } from '$lib/api';
	import GaugeChart from '../charts/GaugeChart.svelte';
	import ScoreCard from '../ScoreCard.svelte';

	export let processedDay: Date;

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
		filter(({ type }) => type === 'expense'),
		reduce((acc, { amount }) => acc + amount, 0)
	);

	$: categories$ = of($transactions.data).pipe(
		switchMap((data) => data?.pages.flatMap((page) => page.transactions) ?? []),
		filter(({ type }) => type === 'expense'),
		groupBy(({ tags }) => tags),
		mergeMap((group$) => group$.pipe(reduce((acc, cur) => [...acc, cur], [])))
	);

	$: percentages$ = combineLatest([categories$, expenses$]).pipe(
		map(($categories$, $expenses$) => Math.round(($categories$ / $expenses$) * 100))
	);
</script>

<ScoreCard label="Categories">
	<GaugeChart data={percentages$} />
</ScoreCard>
