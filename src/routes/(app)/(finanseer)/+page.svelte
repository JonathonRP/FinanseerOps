<script lang="ts">
	import { isSameMonth, parse, startOfMonth, subMonths } from 'date-fns';
	import {
		of,
		from,
		switchMap,
		filter,
		reduce,
		lastValueFrom,
		combineLatest,
		combineLatestWith,
		debounceTime,
	} from 'rxjs';
	import { SvelteSubject } from '$lib/utils';
	import { api } from '$lib/api';
	import ScoreCard from './ScoreCard.svelte';

	export let data;
	const { day } = data;
	const today = new Date();

	const daySelected = new SvelteSubject<Date>(day ?? today);
	$: daySelected.set(day ?? today);

	const accounts = api.buxfer.accounts.query();

	const balance$ = from($accounts.data ?? []).pipe(
		filter(({ name }) => name.includes('1880') || name.includes('1334')),
		reduce((sum, { balance }) => sum + balance, 0)
	);

	// FIXME - why is initial cursor undefined?
	const transactions = api.buxfer.transactions.infiniteQuery(
		{
			startDate: startOfMonth(subMonths($daySelected, 1)),
			endDate: $daySelected,
		},
		{
			keepPreviousData: true,
			getNextPageParam: (lastPage, allPages) => {
				if (
					lastPage &&
					typeof lastPage === 'object' &&
					'totalTransactionsCount' in lastPage &&
					typeof lastPage.totalTransactionsCount === 'number' &&
					Math.ceil(lastPage.totalTransactionsCount / 100) >= allPages.length
				) {
					return allPages.length + 1;
				}
				return undefined;
			},
		}
	);
	const transactions$ = from(
		$transactions.data?.pages.flatMap((page) => {
			const result = page.transactions;
			if ($transactions.hasNextPage) {
				$transactions.fetchNextPage();
			}
			return result;
		}) || []
	);

	const expenses$ = daySelected.pipe(
		debounceTime(150),
		switchMap((selectedDay) => transactions$.pipe(combineLatestWith(of(selectedDay)))),
		filter(([{ type }]) => type === 'expense'),
		reduce(
			([thisMonthSpent, lastMonthSpent], [{ date, amount }, selectedDay]) => {
				const transactionDate = parse(date, 'MM/dd/yyyy', new Date());
				return [
					thisMonthSpent + (isSameMonth(transactionDate, selectedDay || today) ? amount : 0),
					lastMonthSpent + (isSameMonth(transactionDate, subMonths(selectedDay || today, 1)) ? amount : 0),
				];
			},
			[0, 0]
		)
	);

	const prepareFinanseerData = combineLatest([balance$, expenses$]);

	balance$.subscribe(console.log);
	expenses$.subscribe(console.log);
	prepareFinanseerData.subscribe(console.log);
</script>

<svelte:head>
	<title>Finanseer</title>
	<meta name="description" content="Finanseer Finanzen Portal" />
</svelte:head>

{#await lastValueFrom(prepareFinanseerData)}
	<ScoreCard label="Balance" score={undefined} delay={0} />
	<ScoreCard label="Spent" score={undefined} delay={1} />
	<ScoreCard label="Forecast" score={undefined} delay={2} />
{:then [balance, [currMonthSpent, prevMonthSpent]]}
	<ScoreCard label="Balance" score={balance} />
	<ScoreCard label="Spent" score={currMonthSpent} comparison={{ score: prevMonthSpent, swap: true }} />
	<ScoreCard label="Forecast" score={balance - currMonthSpent} />
{/await}
