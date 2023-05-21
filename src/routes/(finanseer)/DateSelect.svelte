<script lang="ts">
	import left from '@iconify-icons/tabler/chevron-left';
	import right from '@iconify-icons/tabler/chevron-right';
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
	import { page } from '$app/stores';
	import { dateFormat } from '$lib/utils';
	import { fly, type FlyParams } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { derived, writable, type Readable } from 'svelte/store';
	import { swipe } from 'svelte-gestures';
	import { api } from '$lib/api';
	import { filter, of, switchMap, toArray } from 'rxjs';

	const today = startOfToday();
	let direction: number;

	$: ({
		url: { searchParams, pathname },
	} = $page);

	export let processedDay: Date;
	export let searchFilter: string | null;

	const height = writable(0);
	let constraintHeight: number;
	let heightOffset: number;
	const containerHeight: Readable<number> = derived(height, ($height, set) => {
		if ($height !== heightOffset) {
			set(constraintHeight + $height - heightOffset);
		}
	});

	let currentDay = today;
	$: prevPeriod = subMonths(currentDay, 1);
	$: nextPeriod = addMonths(currentDay, 1);

	$: daysOfPeriod = eachDayOfInterval({
		start: startOfWeek(startOfMonth(currentDay), { weekStartsOn: 1 }),
		end: endOfWeek(endOfMonth(currentDay), { weekStartsOn: 1 }),
	});

	const next = () => {
		currentDay = nextPeriod;
		direction = 1;
	};

	const previous = () => {
		currentDay = prevPeriod;
		direction = -1;
	};

	const calendarChange = (node: Element, options: FlyParams) => {
		const { delay, duration, easing } = options;
		const h = parseFloat(getComputedStyle(node).height);

		return {
			delay,
			duration,
			easing,
			css: (t: number, u: number) => `
				height: ${$containerHeight >= 310 ? h + (234 - 281 * (t * 2 + u * 2)) : h}px;
				overflow: hidden;
				${fly(node, options)?.css?.(t, u)};
			`,
		};
	};

	// use:pan={{ delay: 200 }}
	// on:pan={function handle(event) {
	// 	// console.log(event.detail);
	// 	if (event.detail.x < 60) next();
	// 	if (event.detail.x > 360) previous();
	// }}

	$: transactions = api.buxfer.transactions.infiniteQuery(
		{
			startDate: startOfMonth(currentDay),
			endDate: currentDay,
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
		switchMap((transactsData) => transactsData?.pages.flatMap((data_page) => data_page.transactions) ?? []),
		filter(({ type, tags, description }) =>
			searchFilter
				? type.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null ||
				  tags.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null ||
				  description.match(new RegExp(`${searchFilter}\\b`, 'i')) !== null
				: true
		),
		toArray()
	);
</script>

<div
	bind:clientHeight={constraintHeight}
	use:swipe
	on:swipe={function handle(event) {
		if (event.detail.direction === 'left') next();
		if (event.detail.direction === 'right') previous();
	}}
	class="calendarContainer overflow-hidden md:min-w-[30rem] md:pr-7 lg:pr-14"
	style:height={`${$containerHeight}px`}>
	<div class="flex items-center">
		{#key currentDay}
			<h2
				in:fly={{ x: 40 * direction, opacity: 0, duration: 500 / 2, delay: 500 / 2, easing: cubicInOut }}
				out:fly={{ x: -40 * direction, opacity: 0, duration: 500 / 2, easing: cubicInOut }}
				class="mr-4 flex-auto font-semibold text-gray-900 dark:text-neutral-309">
				{format(currentDay, 'yyyy, MMM')}
			</h2>
		{/key}
		<button
			id="prev"
			type="button"
			on:click={previous}
			class="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:enabled:text-gray-500 dark:enabled:text-neutral-309">
			<span class="sr-only">Previous month</span>
			<iconify-icon icon={left} class="h-5 w-5" aria-hidden />
		</button>
		<button
			id="next"
			type="button"
			on:click={next}
			class="-my-1.5 -ml-2 -mr-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:enabled:text-gray-500 dark:enabled:text-neutral-309">
			<span class="sr-only">Next month</span>
			<iconify-icon icon={right} class="h-5 w-5" aria-hidden />
		</button>
	</div>
	{#key currentDay}
		<div
			in:fly={{ x: 40 * direction, opacity: 0, duration: 500 / 2, delay: 800 / 2, easing: cubicInOut }}
			out:fly={{ x: -40 * direction, opacity: 0, duration: 500 / 2, delay: 100 / 2, easing: cubicInOut }}
			class="mt-5 grid grid-cols-7 text-center text-xs leading-6 text-gray-500 dark:text-neutral-309">
			{#each daysOfPeriod.slice(0, 7) as day, dayIdx (dayIdx)}
				<span>{format(day, 'eeeeee')}</span>
			{/each}
		</div>
		<div
			bind:clientHeight={$height}
			bind:offsetHeight={heightOffset}
			in:calendarChange={{ x: 40 * direction, opacity: 0, duration: 500 / 2, delay: 800 / 2, easing: cubicInOut }}
			out:calendarChange={{ x: -40 * direction, opacity: 0, duration: 500 / 2, delay: 100 / 2, easing: cubicInOut }}
			class="mt-2 grid grid-cols-7 overflow-hidden text-sm">
			{#each daysOfPeriod as day, dayIdx (day.toLocaleString())}
				{@const { isSelected, dayIsToday, isPartOfMonth } = {
					isSelected: isEqual(day, processedDay || today),
					dayIsToday: isToday(day),
					isPartOfMonth: isSameMonth(day, currentDay),
				}}
				<div
					class="pb-2 pt-1.5 {isSameMonth(day, processedDay || today) &&
						(pathname === '/' || searchFilter) &&
						day <= (processedDay || today) &&
						`bg-primary-400/20 ${
							((isSameDay(day, startOfMonth(day)) || isSameDay(day, startOfWeek(day, { weekStartsOn: 1 }))) &&
								'rounded-s-full') ||
							((isSameDay(day, processedDay || today) || isSameDay(day, endOfWeek(day, { weekStartsOn: 1 }))) &&
								'rounded-e-full')
						}`} {dayIdx > 6
						? 'border-t border-stone-200 border-opacity-75 dark:border-stone-600 dark:border-opacity-25'
						: undefined}">
					<a
						href={`${pathname}${
							((isBefore(day, today) || searchParams.has('search')) &&
								`?${new URLSearchParams({
									...(isBefore(day, today) && { processedDate: format(day, dateFormat) }),
									...(searchParams.has('search') && { search: searchParams.get('search') || '' }),
								})}`) ||
							''
						}
					`}
						class="mx-auto flex h-8 w-8 items-center justify-center rounded-full
							{pathname !== '/' && !searchFilter && isSelected ? 'text-white' : undefined}
							{pathname !== '/' && !searchFilter && isSelected && dayIsToday ? 'bg-primary-500' : undefined}
							{pathname !== '/' && !searchFilter && isSelected && !dayIsToday ? 'bg-gray-900' : undefined}
							{isSelected || dayIsToday ? 'font-semibold' : undefined}
							{!isSelected && dayIsToday ? 'text-primary-500' : undefined}
							{!isSelected ? 'hover:bg-gray-400 enabled:hover:bg-gray-500' : undefined}
							{!isSelected && !dayIsToday && !isPartOfMonth ? 'text-gray-400 dark:text-gray-600' : undefined}
							{!isSelected && !dayIsToday && isPartOfMonth
							? 'text-gray-500 enabled:text-gray-900 dark:enabled:text-neutral-309'
							: undefined}">
						<time datetime={day.toLocaleString()}>
							{format(day, 'd')}
						</time>
					</a>
					{#if $transactions$.some(({ date }) => isSameDay(date, day))}
						<div class="mx-auto mt-1 h-1 w-1 rounded-full bg-primary-400" />
					{/if}
				</div>
			{/each}
		</div>
	{/key}
</div>
