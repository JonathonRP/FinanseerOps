<script lang="ts">
	import { from, filter, reduce, lastValueFrom } from 'rxjs';
	import { isSameMonth, startOfMonth, subMonths } from 'date-fns';
	import { api } from '$lib/api';
	import ScoreCard from './baseScoreCard.svelte';

	export let processedDay: Date;
	export let delay: number;

	$: transactions = api.buxfer.transactions.infiniteQuery(
		{
			startDate: startOfMonth(subMonths(processedDay, 1)),
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

	$: expenses$ = from($transactions.data?.pages.flatMap((page) => page.transactions) ?? []).pipe(
		filter(({ type }) => type === 'expense'),
		reduce(
			({ currMonthSpent, prevMonthSpent }, { date, amount }) => ({
				currMonthSpent: currMonthSpent + (isSameMonth(date, processedDay) ? amount : 0),
				prevMonthSpent: prevMonthSpent + (isSameMonth(date, subMonths(processedDay, 1)) ? amount : 0),
			}),
			{ currMonthSpent: 0, prevMonthSpent: 0 }
		)
	);
</script>

{#await lastValueFrom(expenses$)}
	<ScoreCard label="Spent" score={undefined} {delay} />
{:then {currMonthSpent, prevMonthSpent}}
	<ScoreCard label="Spent" score={currMonthSpent} comparison={{ score: prevMonthSpent, swap: true }} />
{/await}
