<script lang="ts">
	import { filter, switchMap, reduce, of } from 'rxjs';
	import { addDays, format, isSameMonth, startOfMonth, subMonths } from 'date-fns';
	import { api } from '$lib/api';
	import { dateFormat } from '$lib/utils';
	import ScoreCard from '../ScoreCard.svelte';
	import AreaChart from '../charts/AreaChart.svelte';

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
		filter(({ type }) => type === 'income'),
		reduce(
			({ currMonthIncome, prevMonthIncome }, { date, amount }) => ({
				currMonthIncome: currMonthIncome + (isSameMonth(date, processedDay) ? amount : 0),
				prevMonthIncome: prevMonthIncome + (isSameMonth(date, prevMonth) ? amount : 0),
			}),
			{ currMonthIncome: 0, prevMonthIncome: 0 }
		)
	);

	$: processedDate = format(processedDay, dateFormat);

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
</script>

<ScoreCard label="Income" score={$expenses$.currMonthIncome} swap comparison={{ score: $expenses$.prevMonthIncome }}>
	<AreaChart data={data.flatMap(Object.values)} />
</ScoreCard>
