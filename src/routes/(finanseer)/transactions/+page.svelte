<script lang="ts">
	import { isSameDay, startOfMonth, subMonths, formatDistanceToNow, addDays } from 'date-fns';
	import { from, filter, reduce, lastValueFrom, toArray, tap, pipe } from 'rxjs';
	import { api } from '$lib/api';
	import search from '@iconify-icons/tabler/search';
	import dot from '@iconify-icons/mdi/dot';
	import ScoreCard from '$lib/components/dashboardWidgets/widgets/baseScoreCard.svelte';

	export let data;

	const presence = {
		initial: {
			y: 10,
			opacity: 0,
		},
		animate: {
			y: 0,
			opacity: 1,
		},
		exit: {
			y: -10,
			opacity: 0,
		},
	};

	$: ({ processedDay, searchFilter } = data);

	$: transactions = api.buxfer.transactions.infiniteQuery(
		{
			startDate: addDays(processedDay, 1),
			endDate: addDays(processedDay, 1),
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
			onSuccess(infiniteData) {
				if (infiniteData.pageParams.splice(-1)) {
					$transactions.fetchNextPage();
				}
			},
		}
	);

	$: transactions$ = from($transactions.data?.pages.flatMap((page) => page.transactions) || []).pipe(
		filter(({ type, tags, description }) =>
			searchFilter
				? type.match(new RegExp(`${searchFilter}`, 'i')) !== null ||
				  tags.match(new RegExp(`${searchFilter}`, 'i')) !== null ||
				  description.match(new RegExp(`${searchFilter}`, 'i')) !== null
				: true
		),
		tap((val) => console.log(val))
	);

	$: expenses$ = transactions$.pipe(
		filter(({ type }) => type === 'expense'),
		reduce(
			(acc, { amount }) => acc + amount,
			0
		),
	);
</script>

<svelte:head>
	<title>Finanseer - Transactions History</title>
	<meta name="description" content="Finanseer Transactions Receipts" />
</svelte:head>

<div class="h-full md:grid md:grid-cols-2">
	<form
		action=""
		method="get"
		class="flex h-9 w-full rounded-full border-2 border-neutral-808 dark:border-neutral-309 md:col-span-2 md:w-96"
		on:formdata={(e) => {
			Array.from(e.formData.entries()).forEach(([k, v]) => !v && e.formData.delete(k));
		}}>
		<input name="search" class="w-full rounded-full bg-transparent px-3 text-xs" />
		<button
			class="flex border-spacing-0 items-center rounded-full bg-neutral-808 px-[0.625rem] py-[0.525rem] text-sm font-semibold text-neutral-309 hover:bg-neutral-900 dark:bg-neutral-309 dark:text-neutral-808 hover:dark:bg-neutral-400">
			<iconify-icon icon={search} inline />
		</button>
	</form>
	<div
		class="mb-3.5 mt-3 flex h-[28dvh] snap-y snap-mandatory flex-col divide-y-2 divide-stone-200 overflow-auto dark:divide-stone-600 dark:divide-opacity-20 md:h-[50dvh] md:w-96">
		{#await lastValueFrom(transactions$.pipe(toArray()))}
			{#each { length: 6 } as _blank, index (index)}
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
					income: transaction.type === 'income',
					expense: transaction.type === 'expense',
				}}
				<div class="mx-2 flex shrink-0 snap-end items-end justify-between py-4">
					<div>
						<p class="text-base font-semibold text-black dark:text-gray-300">{transaction.description}</p>
						<p class="text-xs text-neutral-309">
							{formatDistanceToNow(transaction.date)} ago <span><iconify-icon icon={dot} inline /></span>
							{transaction.tags || 'Uncategorized'}
						</p>
					</div>
					<div>
						<p
							class="mx-2 flex h-full items-center justify-center rounded-full px-2 py-0.5 text-sm
			{income ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-emerald-400' : undefined}
			{expense ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : undefined}
			{!income && !expense ? 'bg-stone-200 dark:bg-slate-900' : undefined}">
							{transaction.amount.toLocaleString(navigator.languages[0] || navigator.language, {
								style: 'currency',
								currency: 'USD',
								notation: 'compact',
							})}
						</p>
						<p class="mx-2 mt-0.5 flex items-center justify-end px-2 text-xs text-neutral-309">
							{index + 1}/{transacts.length}
						</p>
					</div>
				</div>
			{/each}
		{/await}
	</div>
	<div class="col-span-2 grid grid-cols-[1fr_1fr]">
		<div>
			{#await lastValueFrom(expenses$)}
				<ScoreCard label="Spent" score={undefined} />
			{:then currDaySpent }
				<ScoreCard label="Spent" score={currDaySpent} />
			{/await}
		</div>
	</div>
</div>
