<svelte:options runes={true} />
<script lang="ts">
	import {
		addMonths,
		eachDayOfInterval,
		endOfMonth,
		endOfWeek,
		format,
		isBefore,
		isEqual,
		isSameDay,
		isSameMonth,
		isToday,
		startOfMonth,
		startOfToday,
		startOfWeek,
		subMonths,
	} from 'date-fns';
	import { cn, dateFormat } from '$/lib/utils/index.svelte';
	import { fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { api } from '$lib/api';
	import { filter, of, switchMap, toArray } from 'rxjs';
	import { tick } from 'svelte';
	import { AnimatePresence } from 'svelte-motion';
	import ResizePanel from '$lib/components/ResizePanel.svelte';
	import { page } from '$app/stores';
	import icons from '../icons';

	const {processedDay, searchFilter} = $props<{processedDay: Date, searchFilter: string | null}>()

	const today = startOfToday();
	const {url: {searchParams, pathname}} = $derived($page);


	let width: number = $state(0);
	let direction: number = $state(0);

	let currentDay = $state(today);
	const prevPeriod = $derived(subMonths(currentDay, 1));
	const nextPeriod = $derived(addMonths(currentDay, 1));

	const daysOfPeriod = $derived(eachDayOfInterval({
		start: startOfWeek(startOfMonth(currentDay), { weekStartsOn: 1 }),
		end: endOfWeek(endOfMonth(currentDay), { weekStartsOn: 1 }),
	}));

	const next = async () => {
		direction = 1;
		await tick();
		currentDay = nextPeriod;
	};

	const previous = async () => {
		direction = -1;
		await tick();
		currentDay = prevPeriod;
	};

	const transactions = $derived(api.buxfer.transactions.infiniteQuery(
		{
			startDate: startOfWeek(startOfMonth(currentDay), { weekStartsOn: 1 }),
			endDate: endOfWeek(endOfMonth(currentDay), { weekStartsOn: 1 }),
		},
		{
			initialPageParam: 1,
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
			}
		}
	));

	const transactions$ = $derived(of($transactions.data).pipe(
		switchMap((transactsData) => transactsData?.pages.flatMap((data_page) => data_page.transactions) ?? []),
		filter(({ type, tags, description }) =>
			searchFilter
				? type.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null ||
				  tags.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null ||
				  description.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null
				: true
		),
		toArray()
	));

	$effect(() => {
		if ($transactions.status === 'success' && $transactions.hasNextPage) {
			$transactions.fetchNextPage();
		}
	});
</script>

<div
	class="mx-auto mb-3 min-w-[17rem] max-w-[17rem] flex-shrink-0 overflow-hidden px-3 py-3 border dark:border-slate-600 border-slate-50 rounded-xl">
	<div bind:clientWidth={width}>
		<div class="flex items-center">
			{#key currentDay}
				<h2
					in:fly={{ x: direction * (width / 2), opacity: 0, duration: 500, delay: 500, easing: cubicInOut }}
					out:fly={{ x: direction * -(width / 2), opacity: 0, duration: 500, easing: cubicInOut }}
					class="flex-auto touch-none font-semibold text-gray-900 dark:text-neutral-309">
					{format(currentDay, 'yyyy, MMM')}
				</h2>
			{/key}
			<button
				id="prev"
				type="button"
				on:click={previous}
				class="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:enabled:text-gray-500 dark:enabled:text-neutral-309">
				<span class="sr-only">Previous month</span>
				<svelte:component this={icons.LeftChevronIcon} class="h-5 w-5" aria-hidden />
			</button>
			<button
				id="next"
				type="button"
				on:click={next}
				class="-my-1.5 -mr-1.5 ml-1 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:enabled:text-gray-500 dark:enabled:text-neutral-309">
				<span class="sr-only">Next month</span>
				<svelte:component this={icons.RightChevronIcon} class="h-5 w-5" aria-hidden />
			</button>
		</div>
		<div class="mt-5 grid grid-cols-7 text-center text-xs leading-6 text-gray-500 dark:text-neutral-309">
			{#each daysOfPeriod.slice(0, 7) as day, dayIdx (dayIdx)}
				<span>{format(day, 'eeeeee')}</span>
			{/each}
		</div>
		<ResizePanel>
			{#key currentDay}
				<div
					in:fly={{ x: direction * width, opacity: 0, duration: 500, delay: 550, easing: cubicInOut }}
					out:fly={{
						x: direction * -width,
						position: 'absolute',
						opacity: 0,
						duration: 300,
						delay: 150,
						easing: cubicInOut,
					}}
					class="mt-2 grid grid-cols-7 overflow-hidden text-sm">
					<AnimatePresence intial={false} list={[{ key: currentDay }]} exitBeforeEnter>
						{#each daysOfPeriod as day, dayIdx (day.toLocaleString())}
							{@const { isSelected, dayIsToday, isPartOfMonth } = {
								isSelected: isEqual(day, processedDay || today),
								dayIsToday: isToday(day),
								isPartOfMonth: isSameMonth(day, currentDay),
							}}
							<div
								class={cn("py-1", {'border-t border-stone-200 border-opacity-75 dark:border-stone-600 dark:border-opacity-25': dayIdx > 6})}>
								<span
									class="mx-auto flex h-full w-full items-center justify-center {isSameMonth(
										day,
										processedDay || today
									) &&
										day <= (processedDay || today) &&
										`bg-primary-400/20 ${
											(isSameDay(day, endOfWeek(day, { weekStartsOn: 1 })) && 'rounded-e-full') ||
											((isSameDay(day, startOfMonth(day)) || isSameDay(day, startOfWeek(day, { weekStartsOn: 1 }))) &&
												'rounded-s-full')
										}`} {(isSameDay(day, processedDay || today) && 'rounded-e-full bg-primary-400/20') || ''}">
									<a
										href={`${pathname}${
											((isBefore(day, today) || searchParams.has('search')) &&
												`?${new URLSearchParams({
													...(isBefore(day, today) && { processedDate: format(day, dateFormat) }),
													...(searchParams.has('search') && { search: searchParams.get('search') || '' }),
												})}`) ||
											''
										}`}
										class={cn("mx-auto flex h-8 w-8 items-center justify-center rounded-full", {
											'text-gray-400 dark:text-gray-600': !isSelected && !dayIsToday && !isPartOfMonth,
											'text-gray-900 dark:text-gray-200': !isSelected && !dayIsToday && isPartOfMonth,
											'ring-1 ring-inset ring-primary-400 dark:ring-primary-500 font-semibold': isSelected,
											'font-semibold': dayIsToday,
											'hover:bg-primary-400/20': !isSelected,
											'text-primary-500': dayIsToday && !isSelected,
										})}>
										<time class="relative flex" datetime={day.toLocaleString()}>
											{format(day, 'd')}
											{#if $transactions$
												.filter(({ type }) => type === 'expense')
												.some(({ date }) => isSameDay(date, day))}
												<div
													class="absolute -right-1.5 -top-0 mx-auto h-1 w-1 max-w-[0.25rem] rounded-full bg-primary-400" />
											{/if}
										</time>
									</a>
								</span>
							</div>
						{/each}
					</AnimatePresence>
				</div>
			{/key}
		</ResizePanel>
	</div>
</div>
