<script lang="ts">
	import { formatDistanceToNow, startOfMonth } from 'date-fns';
	import { filter, toArray, switchMap, scan, of, startWith } from 'rxjs';
	import { Motion } from 'svelte-motion';
	import { api } from '$lib/api';
	import { slide } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { numberFormat } from '$lib/utils';

	export let data;

	$: ({ processedDate, processedDay, searchFilter } = data);

	$: transactions = api.buxfer.transactions.infiniteQuery(
		{
			startDate: startOfMonth(processedDay),
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

	$: transactions$ = of($transactions.data).pipe(
		switchMap((transactsData) => transactsData?.pages.flatMap((page) => page.transactions) ?? []),
		filter(({ type, tags, description }) =>
			searchFilter
				? type.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null ||
				  tags.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null ||
				  description.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null
				: true
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
<Motion let:motion>
	<div use:motion class="grid h-full w-[90dvw] max-w-[450px] grid-cols-2 gap-2 md:w-[45dvw] md:max-w-none lg:w-auto">
		<form
			action=""
			method="get"
			class="flex h-10 rounded-full border-2 border-neutral-808 dark:border-neutral-309 w-full col-span-2 xl:col-span-1"
			on:formdata={(e) => {
				Array.from(e.formData.entries()).forEach(([k, v]) => !v && e.formData.delete(k));
			}}>
			<span
				class="flex border-spacing-0 items-center rounded-full mx-[0.625rem] my-[0.525rem] text-base font-bold text-neutral-808 dark:text-neutral-309">
				<iconify-icon icon="tabler:search" inline />
			</span>
			<input type="hidden" name="processedDate" bind:value={processedDate} />
			<input name="search" class="w-full rounded-full bg-inherit px-3 text-xs autofill:bg-none" value={searchFilter} />
		</form>
		<div
			class="col-span-2 flex max-h-[67dvh] min-h-0 snap-y snap-mandatory flex-col divide-y-2 divide-stone-200 overflow-auto dark:divide-stone-600 dark:divide-opacity-20 md:max-h-[77dvh]">
			{#each $transactionsHistory as transaction, index (index)}
				{@const { income, expense } = {
					income: transaction.type === 'income',
					expense: transaction.type === 'expense',
				}}
				<div
					class="mx-2 flex shrink-0 snap-start items-end justify-between overflow-hidden py-4"
					transition:slide={{ duration: 800, easing: cubicInOut }}>
					<div>
						<p class="text-base font-semibold text-black dark:text-gray-300">{transaction.description}</p>
						<p class="text-xs text-neutral-309">
							{formatDistanceToNow(transaction.date)} ago <span><iconify-icon icon="mdi:dot" inline /></span>
							{transaction.tags || 'Uncategorized'}
						</p>
					</div>
					<div>
						<p
							class="mx-2 flex h-full items-center justify-center rounded-full px-2 py-0.5 text-sm
			{income ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-emerald-400' : undefined}
			{expense ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : undefined}
			{!income && !expense ? 'bg-stone-200 dark:bg-slate-900' : undefined}">
							{numberFormat().format(transaction.amount)}
						</p>
						<p class="mx-2 mt-0.5 flex items-center justify-end px-2 text-xs text-neutral-309">
							{index + 1}/{$transactionsHistory.length}
						</p>
					</div>
				</div>
			{/each}
		</div>
		<div
			class="col-span-2 mx-2 flex shrink-0 items-end justify-between overflow-hidden py-4"
			transition:slide={{ duration: 800, easing: cubicInOut }}>
			<div>
				<p class="text-base font-semibold text-black dark:text-gray-300">Total</p>
			</div>
			<div>
				<p
					class="mx-2 flex h-full items-center justify-center rounded-full px-2 py-0.5 text-sm
			{'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'}">
					{numberFormat().format($expenses$)}
				</p>
			</div>
		</div>
	</div>
</Motion>
