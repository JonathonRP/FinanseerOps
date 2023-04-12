<script lang="ts">
	import left from '@iconify-icons/tabler/chevron-left';
	import right from '@iconify-icons/tabler/chevron-right';
	import {
		addMonths,
		eachDayOfInterval,
		endOfMonth,
		endOfWeek,
		format,
		isAfter,
		isBefore,
		isEqual,
		isSameMonth,
		isToday,
		parse,
		startOfMonth,
		startOfToday,
		startOfWeek,
		subMonths,
	} from 'date-fns';
	import { page } from '$app/stores';
	import { dateFormat } from '$lib/utils';

	const today = startOfToday();

	$: date = $page.url.searchParams.get('processedDate');
	$: processedDay = date ? parse(date, dateFormat, new Date()) : undefined;

	let currentDay = today;
	$: prevPeriod = subMonths(currentDay, 1);
	$: nextPeriod = addMonths(currentDay, 1);

	$: daysOfPeriod = eachDayOfInterval({
		start: startOfWeek(startOfMonth(currentDay), { weekStartsOn: 1 }),
		end: endOfWeek(endOfMonth(currentDay), { weekStartsOn: 1 }),
	});
</script>

<div class="md:pr-7 lg:pr-14">
	<div class="flex items-center">
		<h2 class="mr-4 flex-auto font-semibold text-gray-900 dark:text-neutral-309">{format(currentDay, 'yyyy, MMMM')}</h2>
		<button
			id="prev"
			type="button"
			on:click={function prev() {
				currentDay = prevPeriod;
			}}
			class="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:enabled:text-gray-500 dark:enabled:text-neutral-309">
			<span class="sr-only">Previous month</span>
			<iconify-icon icon={left} class="h-5 w-5" aria-hidden />
		</button>
		<button
			id="next"
			type="button"
			on:click={function next() {
				currentDay = nextPeriod;
			}}
			class="-my-1.5 -ml-2 -mr-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:enabled:text-gray-500 dark:enabled:text-neutral-309">
			<span class="sr-only">Next month</span>
			<iconify-icon icon={right} class="h-5 w-5" aria-hidden />
		</button>
	</div>
	<div class="mt-5 grid grid-cols-7 text-center text-xs leading-6 text-gray-500 dark:text-neutral-309">
		{#each daysOfPeriod.slice(0, 7) as day, dayIdx (dayIdx)}
			<div>{format(day, 'eeeeee')}</div>
		{/each}
	</div>
	<div class="mt-2 grid grid-cols-7 text-sm">
		{#each daysOfPeriod as day, dayIdx (day.toLocaleString())}
			{@const { isSelected, dayIsToday, isPartOfMonth } = {
				isSelected: isEqual(day, processedDay || today),
				dayIsToday: isToday(day),
				isPartOfMonth: isSameMonth(day, currentDay),
			}}
			<form
				data-sveltekit-preload-data="tap"
				action=""
				method="get"
				class="pb-2 pt-1.5 {dayIdx > 6
					? 'border-t border-stone-200 border-opacity-75 dark:border-stone-600 dark:border-opacity-25'
					: undefined}">
				<button
					name={(isBefore(day, today) || undefined) && 'processedDate'}
					value={format(day, dateFormat)}
					disabled={isAfter(day, today)}
					class="mx-auto flex h-8 w-8 items-center justify-center rounded-full
							{isSelected ? 'text-white' : undefined}
							{isSelected && dayIsToday ? 'bg-primary-500' : undefined}
							{isSelected || dayIsToday ? 'font-semibold' : undefined}
							{isSelected && !dayIsToday ? 'bg-gray-900' : undefined}
							{!isSelected && dayIsToday ? 'text-primary-500' : undefined}
							{!isSelected ? 'hover:bg-gray-400 enabled:hover:bg-gray-500' : undefined}
							{!isSelected && !dayIsToday && !isPartOfMonth ? 'text-gray-400 dark:text-gray-600' : undefined}
							{!isSelected && !dayIsToday && isPartOfMonth
						? 'text-gray-500 enabled:text-gray-900 dark:enabled:text-neutral-309'
						: undefined}">
					<time datetime={day.toLocaleString()}>
						{format(day, 'd')}
					</time>
				</button>
			</form>
		{/each}
	</div>
</div>
