<svelte:options runes={true} />

<script lang="ts">
	import { cn, eachDay, today as getToday } from '$lib/utils';
	import { from, map } from 'rxjs';
	import { tick } from 'svelte';
	import { AnimatePresence, type Variants } from 'svelte-motion';
	import { Motion } from '$lib/components';
	import ResizePanel from '$lib/components/ResizePanel.svelte';
	import { icons } from '$/icons';
	import { ease } from '$/lib/animations';
	import { page } from '$app/stores';

	const { current, processedDate, searchFilter, bankTransactions } = $derived($page.data);
	const today = getToday();

	let direction: number = $state(0);

	const processedDay = $derived(processedDate ? Temporal.PlainDate.from(processedDate) : today);
	let currentMonth = $state(processedDay.toPlainYearMonth());
	const { daysOfCalendarMonth, next, previous, calendarMonthTransactions } = $derived.by(() => {
		const prevPeriod = currentMonth.subtract({ months: 1 });
		const nextPeriod = currentMonth.add({ months: 1 });
		const startOfMonth = currentMonth.toPlainDate({ day: 1 });
		const monthStartOfWeek = startOfMonth.subtract({ days: startOfMonth.daysInWeek - startOfMonth.dayOfWeek });
		const endOfMonth = currentMonth.toPlainDate({ day: currentMonth.daysInMonth });
		const monthEndOfWeek = endOfMonth.add({ days: endOfMonth.daysInWeek - endOfMonth.dayOfWeek });

		return {
			daysOfCalendarMonth: eachDay({
				start: monthStartOfWeek,
				end: monthEndOfWeek,
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
			calendarMonthTransactions: from(bankTransactions).pipe(
				map((result) => result.filter(({ date }) => date >= monthStartOfWeek && date < monthEndOfWeek))
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
			// title: format(currentMonth, 'yyyy, MMM'),
			title: Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(currentMonth),
			// title output: 2023, Jan
			days: daysOfCalendarMonth.map((day, indx) => ({ key: day.toString(), indx, date: day })),
		},
	]}
	exitBeforeEnter
	custom={direction}
	let:item={month}>
	<div
		class="mx-auto min-w-[17rem] max-w-[17rem] flex-shrink-0 overflow-hidden rounded-xl border border-slate-50 px-3 py-3 dark:border-slate-600">
		<Motion.div
			initial="hidden"
			animate="visible"
			exit="leave"
			variants={{ visible: { transition: { staggerChildren: 0.25 } } }}
			custom={direction}>
			<div class="flex items-center">
				<Motion.h2 variants={slideHeading} custom={direction} class="flex-auto touch-none font-semibold">
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
				{#each month.days.slice(0, 7) as day, dayIdx (dayIdx)}
					<span>{Intl.DateTimeFormat(undefined, { weekday: 'narrow' }).format(day.date)}</span>
				{/each}
			</div>
			<Motion.div variants={slideHorizontal} custom={direction}>
				<ResizePanel>
					<div class="mt-2 grid grid-cols-7 overflow-hidden text-sm">
						{#each month.days as day (day.key)}
							{@const {
								isSelected,
								dayIsToday,
								dayIsPartOfMonth,
								selectedIsSameMonth,
								dayIsStartOfMonth,
								dayIsStartOfWeek,
								dayIsEndOfWeek,
							} = {
								isSelected: day.date === processedDay,
								dayIsToday: day.date === today,
								dayIsPartOfMonth: day.date.toPlainYearMonth() === currentMonth,
								selectedIsSameMonth: processedDay.toPlainYearMonth() === currentMonth,
								dayIsStartOfMonth: day.date === day.date.toPlainYearMonth().toPlainDate({ day: 1 }),
								dayIsStartOfWeek: day.date.dayOfWeek === 1,
								dayIsEndOfWeek: day.date.dayOfWeek === day.date.daysInWeek,
							}}
							<div
								class={cn('py-1', {
									'border-t border-stone-200 border-opacity-75 dark:border-stone-600 dark:border-opacity-25':
										day.indx > 6,
								})}>
								<span
									class={cn('mx-auto flex h-full w-full items-center justify-center', {
										'bg-accent-400/20': selectedIsSameMonth && day.date <= processedDay,
										'rounded-e-full': selectedIsSameMonth && day.date <= processedDay && (dayIsEndOfWeek || isSelected),
										'rounded-s-full':
											selectedIsSameMonth && day.date <= processedDay && (dayIsStartOfMonth || dayIsStartOfWeek),
									})}>
									<a
										href={`${current.pathname}${
											((day.date < today || searchFilter) &&
												`?${new URLSearchParams({
													...(day.date < today && {
														processedDate: day.key,
													}),
													...(searchFilter && { searchFilter }),
												})}`) ||
											''
										}`}
										class={cn('mx-auto flex h-8 w-8 items-center justify-center rounded-full', {
											'text-muted-foreground': !isSelected && !dayIsToday && !dayIsPartOfMonth,
											'font-medium': !isSelected && !dayIsToday && dayIsPartOfMonth,
											'font-semibold ring-1 ring-inset ring-accent-400 dark:ring-accent-500': isSelected,
											'font-semibold': dayIsToday,
											'hover:bg-accent-400/20': !isSelected,
											'text-accent-500': dayIsToday && !isSelected,
										})}>
										<time class="relative flex" datetime={day.key}>
											{Intl.DateTimeFormat(undefined, { day: 'numeric' }).format(day.date)}
											{#if $calendarMonthTransactions
												?.filter(({ type }) => type === 'expense')
												?.some(({ date }) => date === day.date)}
												<div
													class="absolute -right-1.5 -top-0 mx-auto h-1 w-1 max-w-[0.25rem] rounded-full bg-accent-400">
												</div>
											{/if}
										</time>
									</a>
								</span>
							</div>
						{/each}
					</div>
				</ResizePanel>
			</Motion.div>
		</Motion.div>
	</div>
</AnimatePresence>
