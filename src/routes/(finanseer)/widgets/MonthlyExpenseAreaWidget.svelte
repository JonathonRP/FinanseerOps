<script lang="ts">
	import { filter, switchMap, reduce, of } from 'rxjs';
	import { addDays, format, isSameMonth, startOfMonth, subMonths } from 'date-fns';
	import { api } from '$lib/api';
	import { dateFormat } from '$lib/utils';
	import ScoreCard from './ScoreCard.svelte';
	import AreaChart from './AreaChart.svelte';

	export let processedDay: Date;

	$: prevMonth = subMonths(processedDay, 1);
	$: transactions = api.buxfer.transactions.infiniteQuery(
		{
			startDate: startOfMonth(prevMonth),
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
		reduce(
			({ currMonthSpent, prevMonthSpent }, { date, amount }) => ({
				currMonthSpent: currMonthSpent + (isSameMonth(date, processedDay) ? amount : 0),
				prevMonthSpent: prevMonthSpent + (isSameMonth(date, prevMonth) ? amount : 0),
			}),
			{ currMonthSpent: 0, prevMonthSpent: 0 }
		)
	);

	$: processedDate = format(processedDay, dateFormat);
</script>

<form action="/transactions" method="get">
	<input type="hidden" name="processedDate" bind:value={processedDate} />
	<button class="text-start">
		<ScoreCard label="Spent" score={$expenses$.currMonthSpent} swap comparison={{ score: $expenses$.prevMonthSpent }}>
			<AreaChart />
		</ScoreCard>
	</button>
</form>
