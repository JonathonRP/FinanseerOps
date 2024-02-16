<svelte:options runes={true} />

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fly, slide } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { api } from '$lib/api';
	import { formatDistanceToNow, isSameDay, startOfMonth } from 'date-fns';
	import { filter, reduce, startWith, take, from, switchMap } from 'rxjs';
	import { numberFormat } from '$/lib/utils';
	import { AnimateSharedLayout, Motion, AnimatePresence } from 'svelte-motion';
	import { icons } from '$/icons';
	import { base } from '$app/paths';
	import MainLayout from '../(app)/MainLayout.svelte';
	import DateSelect from './DateSelect.svelte';
	import { page } from '$app/stores';

	const { data, children } = $props<{ data: import('./$types').PageData; children: Snippet }>();
	const { processedDate, processedDay, searchFilter, session } = $derived(data);
	const { pathname, origin } = $state($page.url);
	const current = $derived({ pathname, origin });

	const preserveState = $derived(processedDate ? `?${new URLSearchParams({ processedDate })}` : undefined);

	const links = $derived((processedDate && [{ route: `${base}/${preserveState}` }]) || undefined);

	const transactions = $derived(
		from(
			api.buxfer.transactions.query({
				startDate: startOfMonth(processedDay),
				endDate: processedDay,
			})
		).pipe(
			switchMap((transactData) => transactData),
			filter(([{ type, tags, description, date }]) =>
				searchFilter
					? type.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null ||
						tags.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null ||
						description.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null
					: isSameDay(date, processedDay) || true
			),
			take(5)
		)
	);

	const expenses = $derived(
		transactions.pipe(
			filter(([{ type }]) => type === 'expense'),
			reduce((acc, [{ amount }]) => acc + amount, 0),
			startWith(0)
		)
	);
</script>

<MainLayout name="Finanseer" {links} {session}>
	<AnimateSharedLayout type="crossfade">
		<div
			class="flex flex-col-reverse {(current.pathname === '/' && 'lg:flex-row-reverse lg:justify-end') ||
				'lg:w-[332px] lg:flex-row lg:justify-start lg:gap-4'}">
			<Motion layoutId="side-bar" let:motion={aside}>
				<div use:aside class="flex flex-col gap-4">
					<Motion layoutId="main-date-1" let:motion={date}>
						<div use:date class="hidden xl:flex">
							<DateSelect />
						</div>
					</Motion>
					<div class="ml-3 {(current.pathname !== '/' && 'hidden') || ''}">
						<span class="flex items-baseline justify-between">
							<div class="flex flex-col items-start">
								<p class="text-base font-medium">Recent Transactions</p>
								<p class="flex h-full items-center justify-center rounded-full py-0.5 text-xs">
									Spent {numberFormat().format($expenses)}
								</p>
							</div>
							<form
								method="get"
								action="/transactions"
								on:formdata={(e) => {
									Array.from(e.formData.entries()).forEach(([k, v]) => !v && e.formData.delete(k));
								}}>
								<input type="hidden" name="processedDate" value={processedDate} />
								<input type="hidden" name="search" value={searchFilter} />
								<button class="flex flex-row items-center justify-between text-sm">
									See all
									<svelte:component this={icons.RightChevronIcon} class="h-4 w-6 text-base" height inline />
								</button>
							</form>
						</span>
						{#if $transactions.length}
							<div
								class="flex max-w-xs snap-y snap-mandatory flex-col divide-y-2 divide-stone-200 overflow-hidden dark:divide-stone-600 dark:divide-opacity-20">
								{#each $transactions as transaction, index (index)}
									{@const { income, expense } = {
										income: transaction.type === 'income',
										expense: transaction.type === 'expense',
									}}
									<div
										class="mx-2 flex shrink-0 snap-end items-end justify-between overflow-hidden py-4"
										transition:slide={{ duration: 800, easing: cubicInOut }}>
										<div>
											<p class="text-base font-light text-black dark:text-gray-300">{transaction.description}</p>
											<p class="text-xs text-neutral-309">
												{formatDistanceToNow(transaction.date)} ago
												<span><svelte:component this={icons.DotIcon} inline /></span>
												{transaction.tags || 'Uncategorized'}
											</p>
										</div>
										<div>
											<p
												class="mx-2 flex h-full items-center justify-center rounded-full px-2 py-0.5 text-xs
							{income ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-emerald-400' : undefined}
							{expense ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : undefined}
							{!income && !expense ? 'bg-stone-200 dark:bg-slate-900' : undefined}">
												{numberFormat().format(transaction.amount)}
											</p>
											<p class="mx-2 mt-0.5 flex items-center justify-end px-2 text-xs text-neutral-309">
												{index + 1}/{$transactions.length}
											</p>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</Motion>
			<Motion layoutId="main" let:motion={main}>
				<div use:main class="mx-auto h-full w-full sm:mx-0 md:max-w-none lg:min-w-0 lg:max-w-4xl">
					<div class="mb-8 h-full w-full sm:mt-0">
						<!-- TODO: use framer motion AnimatePresence -->
						<!-- in:fly={{
										y: -400 * (pathname === '/' ? 1 : -1),
										duration: 300,
										delay: 300,
										opacity: 0,
										easing: cubicInOut,
									}}
									out:fly={{
										y: -400 * (pathname === '/' ? -1 : 1),
										duration: 300,
										delay: 50,
										opacity: 0,
										easing: cubicInOut,
									}} -->
						{#key pathname}
							<section class="@container">
								<AnimatePresence list={[{ key: pathname }]} exitBeforeEnter>
									{@render children()}
								</AnimatePresence>
							</section>
						{/key}
					</div>
				</div>
			</Motion>
		</div>
	</AnimateSharedLayout>
</MainLayout>
