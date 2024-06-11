<script lang="ts">
	import { icons } from '$/icons';
	import { Tabs } from '$/lib/components/ui/tabs';
	import { userSettings } from '$/lib/stores/userSettings.svelte';
	import { page } from '$app/stores';
	import { eachDayInWeek, startOfMonth, startOfWeek } from '$lib/utils';
	import { from, map } from 'rxjs';
	import { BarChart } from '../charts';

	const { processedDay, bankTransactions } = $page.data;

	const processedDate = $derived(Temporal.PlainDate.from(processedDay));
	const prevMonth = $derived(Temporal.PlainYearMonth.from(processedDay).subtract({ months: 1 }));
	// const tab = $derived(current.pathname.split('/').pop() === 'monthly' ? current.pathname.split('/').pop() ?? "monthly" : "weekly");
	let tab = $state('weekly');
	let week = $state(processedDate.weekOfYear!);
	const weekDays = $derived(eachDayInWeek({ weekOfYear: week!, yearOfWeek: processedDate.yearOfWeek! }));
	const budget = $derived(userSettings.budget);
	const weeklySpendBehavior = $derived.by(() => {
		const selectedWeek = week!;
		return from(bankTransactions).pipe(
			map((result) =>
				[{ value: budget, ignore: true, highlight: true, label: 'budget' }].concat(
					Object.values(
						weekDays
							.map((day) => ({ date: day, value: 0 }))
							.concat(
								result
									.filter(({ date, type }) => {
										return (
											(date instanceof Temporal.PlainDate ? date : Temporal.PlainDate.from(date)).weekOfYear ===
												selectedWeek && type === 'expense'
										);
									})
									.map(({ date, amount }) => ({ date, value: amount }))
							)
							.reduce((acc, { date, value, label }) => {
								(acc[
									Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(
										date instanceof Temporal.PlainDate ? date : Temporal.PlainDate.from(date)
									)
								] ??= {
									date,
									label,
									value: 0,
								}).value += value;
								return acc;
							}, {})
					)
				)
			)
		);
	});

	$inspect($weeklySpendBehavior);
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
			<Tabs.Trigger value="weekly">Weekly</Tabs.Trigger>
			<Tabs.Trigger value="monthly">Monthly</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value={tab} class="space-y-2">
			<BarChart
				data={$weeklySpendBehavior ?? []}
				x={(d) => d.date.toString()}
				tickFormat={(d) => Intl.DateTimeFormat(undefined, { weekday: 'narrow' }).format(Temporal.PlainDate.from(d))}
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
					<svelte:component this={icons.LeftChevronIcon} class="size-5" aria-hidden />
				</button>
				<button
					id="next"
					type="button"
					onclick={async () => {
						week += 1;
					}}
					disabled={week >= processedDate.weekOfYear}
					class="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:enabled:text-gray-500 dark:enabled:text-neutral-309">
					<span class="sr-only">Next month</span>
					<svelte:component this={icons.RightChevronIcon} class="size-5" aria-hidden />
				</button>
			</span>
		</Tabs.Content>
	</Tabs.Root>
</div>
