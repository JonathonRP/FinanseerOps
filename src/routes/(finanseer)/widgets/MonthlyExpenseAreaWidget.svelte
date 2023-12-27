<svelte:options runes={true} />
<script lang="ts">
	import { filter, switchMap, reduce, of } from 'rxjs';
	import { addDays, format, isSameMonth, startOfMonth, subMonths } from 'date-fns';
	import { api } from '$lib/api';
	import { dateFormat } from '$/lib/utils/index.svelte';
	import { ScoreCard } from '../ScoreCard';
	import {AreaChart} from '../charts';

	let {processedDay} = $props<{processedDay: Date}>();

	const prevMonth = $derived(subMonths(processedDay, 1));
	const transactions = $derived(api.buxfer.transactions.infiniteQuery(
		{
			startDate: startOfMonth(prevMonth),
			endDate: addDays(processedDay, 1),
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
		reduce(
			({ currMonthSpent, prevMonthSpent }, { date, amount }) => ({
				currMonthSpent: currMonthSpent + (isSameMonth(date, processedDay) ? amount : 0),
				prevMonthSpent: prevMonthSpent + (isSameMonth(date, prevMonth) ? amount : 0),
			}),
			{ currMonthSpent: 0, prevMonthSpent: 0 }
		)
	));

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

	$effect(() => {
		if ($transactions.status === 'success' && $transactions.hasNextPage) {
			$transactions.fetchNextPage();
		}
	});
</script>

<ScoreCard.Root class='px-5 pb-12 pt-5'>
	<ScoreCard.Header>
		<ScoreCard.Label>
			Spent
		</ScoreCard.Label>
	</ScoreCard.Header>
	<ScoreCard.Content>
		<ScoreCard.Score value={$expenses$.currMonthSpent} swap comparison={{ value: $expenses$.prevMonthSpent }} />
		<AreaChart data={data.flatMap(Object.values)} />
	</ScoreCard.Content>
</ScoreCard.Root>
