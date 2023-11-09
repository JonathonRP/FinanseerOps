<script lang="ts">
	import { filter, switchMap, reduce, of } from 'rxjs';
	import { isSameMonth, startOfMonth, subMonths } from 'date-fns';
	import { api } from '$lib/api';
	import ScoreCard from '../ScoreCard.svelte';

	export let processedDay: Date;
	export let searchFilter: string;

	$: prevMonth = subMonths(processedDay, 1);
	$: transactions = api.buxfer.transactions.infiniteQuery(
		{
			startDate: startOfMonth(prevMonth),
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
		filter(({ type }) => type === 'income'),
		reduce(
			({ currMonthIncome, prevMonthIncome }, { date, amount }) => ({
				currMonthIncome: currMonthIncome + (isSameMonth(date, processedDay) ? amount : 0),
				prevMonthIncome: prevMonthIncome + (isSameMonth(date, prevMonth) ? amount : 0),
			}),
			{ currMonthIncome: 0, prevMonthIncome: 0 }
		)
	);
</script>

<ScoreCard label="Income" score={$expenses$.currMonthIncome} swap comparison={{ score: $expenses$.prevMonthIncome }} />
