<script lang="ts">
	import { page } from '$app/stores';
	import { PeriodBoundaries, WeekDays, type PeriodBoundary, type WeekOptions } from '$lib/utils';
	import left from '@iconify-icons/fa6-solid/chevron-left';
	import right from '@iconify-icons/fa6-solid/chevron-right';
	import { add, eachDayOfInterval, endOfWeek, format, isEqual, isSameMonth, isToday, startOfWeek, sub } from 'date-fns';
	import { addCollection } from 'iconify-icon';

	addCollection({
		prefix: 'fa6-solid',
		icons: {
			left,
			right,
		},
	});

	export let selectedDay = new Date();

	const { today } = $page.data;
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

<div class="max-w-[60ch]">
	<div class="md:grid md:grid-cols-1">
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
						isSelected: isEqual(day, selectedDay),
						dayIsToday: isToday(day),
						isPartOfMonth: isSameMonth(day, currentDay),
					}}
					<div
						class="{dayIdx < 7 &&
							'border-b border-stone-200 border-opacity-75 dark:border-stone-600 dark:border-opacity-25'} pt-1.5 pb-3">
						<button
							type="button"
							on:click={function selectDay() {
								selectedDay = day;
							}}
							class="mx-auto flex h-8 w-8 items-center justify-center rounded-full"
							class:text-white={isSelected}
							class:bg-primary-500={isSelected && dayIsToday}
							class:font-semibold={isSelected || dayIsToday}
							class:bg-gray-900={isSelected && !dayIsToday}
							class:text-primary-500={!isSelected && dayIsToday}
							class:text-gray-500={!isSelected && !dayIsToday && isPartOfMonth}
							class:text-gray-400={!isSelected && !dayIsToday && !isPartOfMonth}
							class:hover:bg-gray-200={!isSelected}
							class:enabled:hover:bg-primary-100={!isSelected}
							class:enabled:text-gray-900={!isSelected && !dayIsToday && isPartOfMonth}
							class:dark:enabled:text-neutral-309={!isSelected && !dayIsToday && isPartOfMonth}
							class:dark:text-gray-600={!isSelected && !dayIsToday && isPartOfMonth}
							disabled={!isSameMonth(day, today) || day > today}>
							<time datetime={day.toLocaleString()}>
								{format(day, 'd')}
							</time>
						</button>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
