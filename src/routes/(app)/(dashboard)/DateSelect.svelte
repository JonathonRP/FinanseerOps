<svelte:options runes={true} />

<script lang="ts">
	import {
		addMonths,
		eachDayOfInterval,
		endOfMonth,
		endOfWeek,
		format,
		isAfter,
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
	import { cn, dateFormat } from '$lib/utils';
	import { catchError, filter, from, map, of, switchMap, tap } from 'rxjs';
	import { tick } from 'svelte';
	import { AnimatePresence, type Variants } from 'svelte-motion';
	import { Motion } from '$lib/components';
	import ResizePanel from '$lib/components/ResizePanel.svelte';
	import { icons } from '$/icons';
	import { ease, staggerChildren } from '$/lib/animations';
	import { page } from '$app/stores';

	const { current, processedDate, searchFilter, transactions } = $derived($page.data);
	const today = startOfToday();

	let direction: number = $state(0);

	const processedDay = $derived((processedDate && new Date(processedDate)) || today);
	let currentMonth = $state(processedDay);
	const { daysOfPeriod, next, previous, calendarMonthTransactions } = $derived.by(() => {
		const weekStartsOn = 1;
		const prevPeriod = subMonths(currentMonth, 1);
		const nextPeriod = addMonths(currentMonth, 1);
		const monthWeekStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn });
		const monthWeekEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn });

		return {
			daysOfPeriod: eachDayOfInterval({
				start: monthWeekStart,
				end: monthWeekEnd,
			}),
			next: async () => {
				direction = 1;
				await tick();
				currentMonth = nextPeriod;
			},
			previous: async () => {
				direction = -1;
				await tick();
				currentMonth = prevPeriod;
			},
			calendarMonthTransactions: from(transactions).pipe(
				map((result) => result.filter(({ date }) => isAfter(date, monthWeekStart) && isBefore(date, monthWeekEnd)))
			),
		};
	});

	const slideHeading: Variants = {
		hidden: (direction) => ({
			x: `${100 * direction}%`,
			opacity: 0,
			transition: { opacity: { duration: 0.45 } },
		}),
		visible: {
			x: '0%',
			opacity: 1,
			transition: {
				duration: 0.8,
				ease,
			},
		},
		leave: (direction) => ({
			position: 'static',
			x: `${-100 * direction}%`,
			opacity: 0,
			transition: {
				opacity: {
					duration: 0.35,
				},
			},
		}),
	};

	const slideHorizontal: Variants = {
		hidden: (direction) => ({ x: `${100 * direction}%`, opacity: 0 }),
		visible: {
			x: '0%',
			opacity: 1,
			transition: {
				duration: 0.8,
				ease,
			},
		},
		leave: (direction) => ({
			position: 'static',
			x: `${-100 * direction}%`,
			opacity: 0,
			transition: {
				opacity: {
					duration: 0.1,
				},
			},
		}),
	};
</script>

<AnimatePresence
	list={[
		{
			key: currentMonth,
			title: format(currentMonth, 'yyyy, MMM'),
			days: daysOfPeriod.map((day, indx) => ({ key: format(day, dateFormat), indx, date: day })),
		},
	]}
	exitBeforeEnter
	custom={direction}
	let:item={month}>
	<!-- use:layout -->
	<div
		class="mx-auto min-w-[17rem] max-w-[17rem] flex-shrink-0 overflow-hidden rounded-xl border border-slate-50 px-3 py-3 dark:border-slate-600">
		<Motion.div
			initial="hidden"
			animate="visible"
			exit="leave"
			variants={{ visible: { transition: { staggerChildren: 0.25 } } }}
			custom={direction}>
			<div class="flex items-center">
				<Motion.h2
					variants={slideHeading}
					custom={direction}
					class="flex-auto touch-none font-semibold">
					{month.title}
				</Motion.h2>
				<button
					id="prev"
					type="button"
					onclick={previous}
					class="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:enabled:text-gray-500 dark:enabled:text-neutral-309">
					<span class="sr-only">Previous month</span>
					<svelte:component this={icons.LeftChevronIcon} class="h-5 w-5" aria-hidden />
				</button>
				<button
					id="next"
					type="button"
					onclick={next}
					class="-my-1.5 -mr-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:enabled:text-gray-500 dark:enabled:text-neutral-309">
					<span class="sr-only">Next month</span>
					<svelte:component this={icons.RightChevronIcon} class="h-5 w-5" aria-hidden />
				</button>
			</div>
			<div class="mt-5 grid grid-cols-7 text-center text-xs leading-6">
				{#each daysOfPeriod.slice(0, 7) as day, dayIdx (dayIdx)}
					<span>{format(day, 'eeeeee')}</span>
				{/each}
			</div>
			<Motion.div variants={slideHorizontal} custom={direction}>
				<ResizePanel>
					<div class="mt-2 grid grid-cols-7 overflow-hidden text-sm">
						{#each month.days as day (day.key)}
							{@const { isSelected, dayIsToday, isPartOfMonth } = {
								isSelected: isEqual(day.date, processedDay),
								dayIsToday: isToday(day.date),
								isPartOfMonth: isSameMonth(day.date, currentMonth),
							}}
							<div
								class={cn('py-1', {
									'border-t border-stone-200 border-opacity-75 dark:border-stone-600 dark:border-opacity-25':
										day.indx > 6,
								})}>
								<span
									class={cn('mx-auto flex h-full w-full items-center justify-center', {
										'bg-accent-400/20': isSameMonth(day.date, processedDay) && day.date <= processedDay,
										'rounded-e-full':
											isSameMonth(day.date, processedDay) &&
											day.date <= processedDay &&
											(isSameDay(day.date, endOfWeek(day.date, { weekStartsOn: 1 })) || isSelected),
										'rounded-s-full':
											isSameMonth(day.date, processedDay) &&
											day.date <= processedDay &&
											(isSameDay(day.date, startOfMonth(day.date)) ||
												isSameDay(day.date, startOfWeek(day.date, { weekStartsOn: 1 }))),
									})}>
									<a
										href={`${current.pathname}${
											((isBefore(day.date, today) || searchFilter) &&
												`?${new URLSearchParams({
													...(isBefore(day.date, today) && {
														processedDate: day.key,
													}),
													...(searchFilter && { searchFilter }),
												})}`) ||
											''
										}`}
										class={cn('mx-auto flex h-8 w-8 items-center justify-center rounded-full', {
											'text-muted-foreground': !isSelected && !dayIsToday && !isPartOfMonth,
											'font-medium': !isSelected && !dayIsToday && isPartOfMonth,
											'font-semibold ring-1 ring-inset ring-accent-400 dark:ring-accent-500': isSelected,
											'font-semibold': dayIsToday,
											'hover:bg-accent-400/20': !isSelected,
											'text-accent-500': dayIsToday && !isSelected,
										})}>
										<time class="relative flex" datetime={day.key}>
											{format(day.date, 'd')}
											{#if $calendarMonthTransactions
												?.filter(({ type }) => type === 'expense')
												?.some(({ date }) => isSameDay(date, day.date))}
												<div
													class="absolute -right-1.5 -top-0 mx-auto h-1 w-1 max-w-[0.25rem] rounded-full bg-accent-400" />
											{/if}
										</time>
									</a>
								</span>
							</div>
						{/each}
					</div></ResizePanel>
			</Motion.div>
		</Motion.div>
	</div>
</AnimatePresence>
