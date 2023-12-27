<svelte:options runes={true} />
<script lang="ts">
	import { filter, switchMap, of, reduce, groupBy, combineLatest, map, mergeMap } from 'rxjs';
	import { startOfMonth } from 'date-fns';
	import { api } from '$lib/api';
	import { ScoreCard } from '../ScoreCard';
	import { GaugeChart } from '../charts';

	const {processedDay} = $props<{processedDay: Date}>();

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
		filter(({ type }) => type === 'expense'),
		reduce((acc, { amount }) => acc + amount, 0)
	));

	const categories$ = $derived(of($transactions.data).pipe(
		switchMap((data) => data?.pages.flatMap((page) => page.transactions) ?? []),
		filter(({ type }) => type === 'expense'),
		groupBy(({ tags }) => tags),
		mergeMap((group$) => group$.pipe(reduce((acc, cur) => acc + cur.amount, 0)))
	));

	const percentages$ = $derived(combineLatest([categories$, expenses$]).pipe(
		map(([$categories$, $expenses$]) => Math.round(($categories$ / $expenses$) * 100))
	));

	$effect(() => {
		if ($transactions.status === 'success' && $transactions.hasNextPage) {
			$transactions.fetchNextPage();
		}
	});
</script>

<ScoreCard.Root>
	<ScoreCard.Header>
		<ScoreCard.Label>
			Categories
		</ScoreCard.Label>
	</ScoreCard.Header>
	<ScoreCard.Content>
		<GaugeChart data={[$percentages$]} />
	</ScoreCard.Content>
</ScoreCard.Root>
