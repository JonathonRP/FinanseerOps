<script lang="ts">
	import { formatDistanceToNow, addDays, startOfMonth, isSameDay } from 'date-fns';
	import { filter, toArray, switchMap, scan, of, startWith } from 'rxjs';
	import { api } from '$lib/api';
	import search from '@iconify-icons/tabler/search';
	import dot from '@iconify-icons/mdi/dot';
	import { slide } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { numberFormat } from '$lib/utils';

	export let data;

	$: ({ processedDate, processedDay, searchFilter } = data);

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

	$: transactions$ = of($transactions.data).pipe(
		switchMap((transactsData) => transactsData?.pages.flatMap((page) => page.transactions) ?? []),
		filter(({ type, tags, description, date }) =>
			searchFilter
				? type.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null ||
				  tags.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null ||
				  description.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null
				: isSameDay(date, processedDay)
		)
	);

	$: transactionsHistory = transactions$.pipe(toArray());

	$: expenses$ = transactions$.pipe(
		filter(({ type }) => type === 'expense'),
		scan((acc, { amount }) => acc + amount, 0),
		startWith(0)
	);
</script>

<svelte:head>
	<title>Finanseer - Transactions History</title>
	<meta name="description" content="Finanseer Transactions Receipts" />
</svelte:head>
<div class="grid h-full w-[90dvw] max-w-[450px] grid-cols-2 gap-4 md:w-[45dvw] md:max-w-none">
	<form
		action=""
		method="get"
		class="col-span-2 flex h-9 rounded-full border-2 border-neutral-808 dark:border-neutral-309"
		on:formdata={(e) => {
			Array.from(e.formData.entries()).forEach(([k, v]) => !v && e.formData.delete(k));
		}}>
		<input type="hidden" name="processedDate" bind:value={processedDate} />
		<input name="search" class="w-full rounded-full bg-transparent px-3 text-xs" value={searchFilter} />
		<button
			class="flex border-spacing-0 items-center rounded-full bg-neutral-808 px-[0.625rem] py-[0.525rem] text-sm font-semibold text-neutral-309 hover:bg-neutral-900 dark:bg-neutral-309 dark:text-neutral-808 hover:dark:bg-neutral-400">
			<iconify-icon icon={search} inline />
		</button>
	</form>

	<div
		class="col-span-2 flex max-h-[28dvh] min-h-0 snap-y snap-mandatory flex-col divide-y-2 divide-stone-200 overflow-auto dark:divide-stone-600 dark:divide-opacity-20 md:max-h-[50dvh]">
		{#each $transactionsHistory as transaction, index (index)}
			{@const { income, expense } = {
				income: transaction.type === 'income',
				expense: transaction.type === 'expense',
			}}
			<div
				class="mx-2 flex shrink-0 snap-end items-end justify-between overflow-hidden py-4"
				transition:slide={{ duration: 800, easing: cubicInOut }}>
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
						{transaction.amount.toLocaleString(navigator.languages[0] || navigator.language, numberFormat)}
					</p>
					<p class="mx-2 mt-0.5 flex items-center justify-end px-2 text-xs text-neutral-309">
						{index + 1}/{$transactionsHistory.length}
					</p>
				</div>
			</div>
		{/each}
		<div
			class="mx-2 flex shrink-0 snap-end items-end justify-between overflow-hidden py-4"
			transition:slide={{ duration: 800, easing: cubicInOut }}>
			<div>
				<p class="text-base font-semibold text-black dark:text-gray-300">Total</p>
			</div>
			<div>
				<p
					class="mx-2 flex h-full items-center justify-center rounded-full px-2 py-0.5 text-sm
			{'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'}">
					{$expenses$.toLocaleString(navigator.languages[0] || navigator.language, numberFormat)}
				</p>
			</div>
		</div>
	</div>
</div>
