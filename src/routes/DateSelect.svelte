<script lang="ts">
	import { PeriodBoundaries, WeekDays, type PeriodBoundary, type WeekOptions } from '$lib/utils';
	import left from '@iconify-icons/tabler/chevron-left';
	import right from '@iconify-icons/tabler/chevron-right';
	import { addCollection } from 'iconify-icon';
	import { add, eachDayOfInterval, endOfWeek, format, isEqual, isSameMonth, isToday, startOfWeek, sub } from 'date-fns';

	addCollection({
		prefix: 'tabler',
		icons: {
			left,
			right,
		},
	});

	export let selectedDay: Date | undefined;

	const today = new Date();
	const weekOptions: Partial<WeekOptions> = { weekStartsOn: WeekDays[1].Monday };

	const dayOfWeek = (select: PeriodBoundary, day: Date): Date => {
		if (select === PeriodBoundaries.at(0)) {
			return startOfWeek(day, weekOptions);
		}
		return endOfWeek(day, weekOptions);
	};

	let currentDay = today;
	$: prevPeriod = sub(currentDay, { weeks: 1 });
	$: nextPeriod = add(currentDay, { weeks: 1 });

	$: disablePrev = !isSameMonth(today, dayOfWeek('end', prevPeriod));
	$: disableNext = !isSameMonth(today, dayOfWeek('start', nextPeriod)) || dayOfWeek('start', nextPeriod) > today;

	$: daysOfPeriod = eachDayOfInterval({
		start: dayOfWeek('start', currentDay),
		end: dayOfWeek('end', currentDay),
	});
</script>

<div class="md:pr-14">
	<div class="flex items-center">
		<h2 class="flex-0 mr-4 font-semibold text-gray-900 dark:text-neutral-309">{format(today, 'yyyy, MMM dd')}</h2>
		<button
			id="prev"
			type="button"
			on:click={function prev() {
				currentDay = prevPeriod;
			}}
			class="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:enabled:text-gray-500 dark:enabled:text-neutral-309"
			disabled={disablePrev}
			hidden={disablePrev}
			aria-hidden={disablePrev}>
			<span class="sr-only">Previous week</span>
			<iconify-icon icon={left} class="h-5 w-5" hidden={disablePrev} aria-hidden />
		</button>
		<button
			id="next"
			type="button"
			on:click={function next() {
				currentDay = nextPeriod;
			}}
			class="-my-1.5 -mr-1.5 -ml-1 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:enabled:text-gray-500 dark:enabled:text-neutral-309"
			disabled={disableNext}
			hidden={disableNext}
			aria-hidden={disableNext}>
			<span class="sr-only">Next week</span>
			<iconify-icon icon={right} class="h-5 w-5" hidden={disableNext} aria-hidden />
		</button>
	</div>
	<div class="mt-5 grid grid-cols-7 text-center text-xs leading-6 text-gray-500 dark:text-neutral-309">
		{#each daysOfPeriod as day, dayIdx (dayIdx)}
			<div>{format(day, 'eeeeee')}</div>
		{/each}
	</div>
	<div class="mt-2 grid grid-cols-7 text-sm">
		{#each daysOfPeriod as day, dayIdx (day.toLocaleString())}
			{@const { isSelected, dayIsToday, isPartOfMonth } = {
				isSelected: isEqual(day, selectedDay || today),
				dayIsToday: isToday(day),
				isPartOfMonth: isSameMonth(day, currentDay),
			}}
			<div
				class="pt-1.5 pb-3 {dayIdx < 7
					? 'border-b border-stone-200 border-opacity-75 dark:border-stone-600 dark:border-opacity-25'
					: undefined}">
				<button
					type="button"
					on:click={function selectDay() {
						selectedDay = day;
					}}
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
						: undefined}"
					disabled={!isSameMonth(day, today) || day > today}>
					<time datetime={day.toLocaleString()}>
						{format(day, 'd')}
					</time>
				</button>
			</div>
		{/each}
	</div>
</div>
