<svelte:options runes={true} />
<script lang="ts">
	import { filter, switchMap, reduce, of } from 'rxjs';
	import { isSameMonth, startOfMonth, subMonths } from 'date-fns';
	import { api } from '$lib/api';
	import { ScoreCard } from '../ScoreCard';

	const {processedDay, searchFilter} = $props<{processedDay: Date, searchFilter: string}>();

	const prevMonth = $derived(subMonths(processedDay, 1));
	const transactions = $derived(api.buxfer.transactions.infiniteQuery(
		{
			startDate: startOfMonth(prevMonth),
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
		filter(({ type }) => type === 'income'),
		reduce(
			({ currMonthIncome, prevMonthIncome }, { date, amount }) => ({
				currMonthIncome: currMonthIncome + (isSameMonth(date, processedDay) ? amount : 0),
				prevMonthIncome: prevMonthIncome + (isSameMonth(date, prevMonth) ? amount : 0),
			}),
			{ currMonthIncome: 0, prevMonthIncome: 0 }
		)
	));

	$effect(() => {
		if ($transactions.status === 'success' && $transactions.hasNextPage) {
			$transactions.fetchNextPage();
		}
	});
</script>

<ScoreCard.Root class='px-5 pb-12 pt-5'>
	<ScoreCard.Header>
		<ScoreCard.Label>
			Income
		</ScoreCard.Label>
	</ScoreCard.Header>
	<ScoreCard.Content>
		<ScoreCard.Score value={$expenses$.currMonthIncome} swap comparison={{ value: $expenses$.prevMonthIncome }} />
	</ScoreCard.Content>
</ScoreCard.Root>
