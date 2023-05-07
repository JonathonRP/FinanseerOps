<script lang="ts">
	import { from, filter, reduce, lastValueFrom } from 'rxjs';
	import { addDays, isSameMonth, startOfMonth } from 'date-fns';
	import { api } from '$lib/api';
	import ScoreCard from './ScoreCard.svelte';

	export let processedDay: Date;
	export let delay: number;

	$: transactions = api.buxfer.transactions.infiniteQuery(
		{
			startDate: startOfMonth(processedDay),
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

	$: expenses$ = from($transactions.data?.pages.flatMap((page) => page.transactions) ?? []).pipe(
		filter(({ type }) => type === 'expense'),
		reduce((acc, { date, amount }) => acc + (isSameMonth(date, processedDay) ? amount : 0), 0)
	);
</script>

{#await lastValueFrom(expenses$)}
	<ScoreCard label="Budget" score={undefined} {delay} />
{:then spent}
	<ScoreCard label="Budget" score={2000} comparison={{ score: spent, swap: true }} />
{/await}
