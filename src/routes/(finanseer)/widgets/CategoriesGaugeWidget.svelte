<svelte:options runes={true} />
<script lang="ts">
	import type { ForwardMotionProps } from '$lib/animations';
	import { filter, switchMap, of, reduce, groupBy, combineLatest, map, mergeMap } from 'rxjs';
	import { startOfMonth } from 'date-fns';
	import { api } from '$lib/api';
	import { Score } from '../score';
	import { GaugeChart } from '../charts';
	import DashboardWidget from '../DashboardWidget.svelte';

	const { processedDay, ...motion } = $props<{processedDay: Date} & ForwardMotionProps>();

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

<DashboardWidget {motion}>
	<Score.Root>
		<Score.Header>
			<Score.Label>
				Categories
			</Score.Label>
		</Score.Header>
		<Score.Content>
			<GaugeChart data={[$percentages$]} />
		</Score.Content>
	</Score.Root>
</DashboardWidget>