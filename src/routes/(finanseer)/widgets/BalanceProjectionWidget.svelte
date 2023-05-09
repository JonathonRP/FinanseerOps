<script lang="ts">
	import { from, filter, reduce, combineLatest, switchMap, of } from 'rxjs';
	import { addDays, startOfMonth } from 'date-fns';
	import { api } from '$lib/api';
	import ScoreCard from './ScoreCard.svelte';

	export let processedDay: Date;

	$: accounts = api.buxfer.accounts.query();

	$: balance$ = from($accounts.data ?? []).pipe(
		filter(({ name }) => name.includes('1880') || name.includes('1334')),
		reduce((sum, { balance }) => sum + balance, 0)
	);

	$: transactions = api.buxfer.transactions.infiniteQuery(
		{
			startDate: addDays(startOfMonth(processedDay), 1),
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
		switchMap((data) => from(data?.pages.flatMap((page) => page.transactions) ?? [])),
		filter(({ type }) => type === 'expense'),
		reduce((acc, { amount }) => acc + amount, 0)
	);

	$: forcast$ = combineLatest([balance$, expenses$]).pipe(reduce((acc, [bal, exp]) => bal - exp, 0));
</script>

<ScoreCard label="Forecast" score={$forcast$} />
