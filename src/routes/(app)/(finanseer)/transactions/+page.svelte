<!-- TODO - list of transactions (with info). search bar at top, total score card to right -->
<script lang="ts">
	import { isSameMonth, parse, startOfMonth, subMonths, formatRelative } from 'date-fns';
	import { of, from, switchMap, filter, reduce, lastValueFrom, debounceTime, combineLatestWith, toArray } from 'rxjs';
	import { SvelteSubject } from '$lib/utils';
	import { api } from '$lib/api';
	import ScoreCard from '../ScoreCard.svelte';

	export let data;
	const { day } = data;

	const today = new Date();

	const daySelected = new SvelteSubject<Date>(day ?? today);
	$: daySelected.set(day ?? today);

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
					allPages.length < Math.ceil(lastPage.totalTransactionsCount / 100)
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

	const transactionHistory$ = daySelected.pipe(
		debounceTime(150),
		switchMap((selectedDay) =>
			transactions$.pipe(filter(({ date }) => isSameMonth(parse(date, 'MM-yyyy', new Date()), selectedDay)))
		),
		toArray()
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

	expenses$.subscribe((val) => console.log(val));
</script>

<svelte:head>
	<title>Finanseer - Transactions History</title>
	<meta name="description" content="Finanseer Transactions Receipts" />
</svelte:head>

<div class="h-full md:grid md:grid-cols-[1fr_1fr]">
	<div
		class="flex h-[26dvh] flex-col divide-y-2 divide-gray-100 overflow-hidden dark:divide-gray-500 md:mr-14 md:h-[80dvh] md:w-28">
		{#await lastValueFrom(transactionHistory$)}
			{#each new Array(3) as _blank, index (index)}
				<div class="h-full">
					<div
						class="flex h-full w-full animate-pulse flex-row items-center justify-center space-x-5 pt-1"
						class:animation-delay-150={index % 1 === 0}
						class:animation-delay-300={index % 2 === 0}
						style="animation-fill-mode: backwards">
						<div
							class="via-gray h-8 w-44 animate-gradient-x rounded-md bg-gradient-to-r from-gray-300 via-white to-gray-50 dark:from-gray-800 dark:via-gray-500 dark:to-gray-600"
							class:animation-delay-150={index % 1 === 0}
							class:animation-delay-300={index % 2 === 0}
							style="animation-fill-mode: backwards" />
					</div>
					<p class="hidden">
						{_blank}
					</p>
				</div>
			{/each}
		{:then transacts}
			{#each transacts as transaction, index (index)}
				{@const { income, expense } = {
					income: Math.sign(transaction.amount) === -1,
					expense: Math.sign(transaction.amount) === 1,
				}}
				<div class="flex h-full w-full justify-between">
					<div>
						<p class="text-base font-semibold text-black">{transaction.description}</p>
						<p class="text-xs text-gray-200">
							{formatRelative(parse(transaction.date, 'MM/dd/yyyy', new Date()), new Date())}
						</p>
					</div>
					<p
						class="mx-2 flex items-center rounded-full px-2 py-0.5 text-sm
                        {income ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-emerald-400' : undefined}
                        {expense ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : undefined}">
						{transaction.amount}
					</p>
					<p class="text-xs text-gray-200">
						{index + 1}/{transacts.length}
					</p>
				</div>
			{/each}
		{/await}
	</div>
	<div class="max-h-[6.8rem]">
		{#await lastValueFrom(expenses$)}
			<ScoreCard label="Spent" score={undefined} delay={1} />
		{:then [currMonthSpent, prevMonthSpent]}
			<ScoreCard label="Spent" score={currMonthSpent} comparison={{ score: prevMonthSpent, swap: true }} />
		{/await}
	</div>
</div>
