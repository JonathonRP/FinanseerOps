<script lang="ts">
	import { isSameMonth, startOfMonth, subMonths } from 'date-fns';
	import { from, filter, reduce, combineLatest, lastValueFrom } from 'rxjs';
	import { api } from '$lib/api';
	import ScoreCard from './ScoreCard.svelte';

	export let data;
	$: ({ processedDay } = data);

	$: accounts = api.buxfer.accounts.query();

	$: balance$ = from($accounts.data ?? []).pipe(
		filter(({ name }) => name.includes('1880') || name.includes('1334')),
		reduce((sum, { balance }) => sum + balance, 0)
	);

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

<svelte:head>
	<title>Finanseer</title>
	<meta name="description" content="Finanseer Finanzen Portal" />
</svelte:head>

{#await lastValueFrom(combineLatest([balance$, expenses$]))}
	<ScoreCard label="Balance" score={undefined} delay={0} />
	<ScoreCard label="Spent" score={undefined} delay={1} />
	<ScoreCard label="Forecast" score={undefined} delay={2} />
{:then [balance, { currMonthSpent, prevMonthSpent }]}
	<ScoreCard label="Balance" score={balance} />
	<ScoreCard label="Spent" score={currMonthSpent} comparison={{ score: prevMonthSpent, swap: true }} />
	<ScoreCard label="Forecast" score={balance - currMonthSpent} />
{/await}
