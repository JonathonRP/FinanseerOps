<script lang="ts">
	import { from, map } from 'rxjs';
	import { Tabs } from '$/lib/components/ui/tabs';
	import { page } from '$app/stores';
	import { BarChart } from '../charts';
	import { icons } from '$/icons';
	import { startOfMonth, startOfWeek, endOfWeek, eachDay, today } from '$lib/utils';
	import { userSettings } from '$/lib/stores/userSettings.svelte';

	const { bankTransactions, processedDate } = $page.data;
	const processedDay = $derived(processedDate ? Temporal.PlainDate.from(processedDate) : today());
	const prevMonth = $derived(processedDay.subtract({ months: 1 }));
	// const tab = $derived(current.pathname.split('/').pop() === 'monthly' ? current.pathname.split('/').pop() ?? "monthly" : "weekly");
	let tab = $state('weekly');
	let week = $state(processedDay.weekOfYear);
	const weekDay = $derived(Temporal.PlainDate.from(String(week)));
	const weekStart = $derived(startOfWeek(weekDay));
	const weekDays = $derived(eachDay({ start: weekStart, end: endOfWeek(weekStart) }));
	const budget = $derived(userSettings.budget);
	const weeklySpendBehavior = $derived.by(() =>
		from(bankTransactions).pipe(
			map((result) =>
				[{ value: budget, ignore: true, highlight: true }].concat(
					Object.values(
						weekDays
							.map((day) => ({ date: day, value: 0 }))
							.concat(
								result
									.filter(
										({ type, date }) =>
											(date.weekOfYear === weekDay.weekOfYear || date.weekOfYear === today().weekOfYear) &&
											type === 'expense'
									)
									.map(({ date, amount }) => ({ date, value: amount }))
							)
							.reduce((acc, { date, value }) => {
								(acc[Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date)] ??= {
									date,
									value: 0,
								}).value += value;
								return acc;
							}, {})
					)
				)
			)
		)
	);

	// $inspect(weekDays, week, weekStart, endOfWeek(weekStart, { weekStartsOn }));
	// $inspect(weekDateSpan, weekPage)
</script>

<div class="flex items-center justify-center gap-2 rounded-lg border-2 border-border md:hidden">
	<!-- onValueChange={async (value) => {
			if (browser) {
				let location = `${base}`;
				location = location.concat(current.pathname.split('/').pop() ?? '');

				await goto(`${location}/${value === 'monthly' ? value : ''}`);
			}
		}} -->
	<Tabs.Root bind:value={tab} activateOnFocus={false} class="flex flex-col items-center">
		<Tabs.List class="mt-2 grid w-max grid-cols-2 lg:-ml-6">
			<Tabs.Trigger value="monthly">Monthly</Tabs.Trigger>
			<Tabs.Trigger value="weekly">Weekly</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value={tab} class="space-y-2">
			<BarChart
				data={$weeklySpendBehavior ?? []}
				axisFormat={(d) => Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(d)}
				showAverage
				showHighlightAsRule
				class="h-[200px] w-[300px] from-emerald-600 to-green-500 fill-foreground px-4 dark:from-green-500 dark:to-emerald-600" />
			<span class="flex items-center justify-center pb-3">
				<p>
					{Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).formatRange(
						weekDays[0],
						weekDays[weekDays.length - 1]
					)}
				</p>
				<button
					id="prev"
					type="button"
					onclick={async () => {
						week -= 1;
					}}
					disabled={week <= startOfWeek(startOfMonth(prevMonth)).weekOfYear}
					class="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:enabled:text-gray-500 dark:enabled:text-neutral-309">
					<span class="sr-only">Previous month</span>
					<svelte:component this={icons.LeftChevronIcon} class="h-5 w-5" aria-hidden />
				</button>
				<button
					id="next"
					type="button"
					onclick={async () => {
						week += 1;
					}}
					disabled={week >= processedDay.weekOfYear}
					class="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:enabled:text-gray-500 dark:enabled:text-neutral-309">
					<span class="sr-only">Next month</span>
					<svelte:component this={icons.RightChevronIcon} class="h-5 w-5" aria-hidden />
				</button>
			</span>
		</Tabs.Content>
	</Tabs.Root>
</div>
