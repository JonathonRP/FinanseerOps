<script lang="ts">
	import { isSameMonth, sub } from 'date-fns';
	import {
		of,
		switchMap,
		filter,
		reduce,
		lastValueFrom,
		concatAll,
		combineLatest,
		debounceTime,
		combineLatestWith,
		take,
		tap,
	} from 'rxjs';
	import { SvelteSubject } from '$lib/utils';
	import { Buxfer } from '$lib/stores/buxfer';
	import type { PageData } from './$types';
	import DateSelect from './DateSelect.svelte';
	import ScoreCard from './ScoreCard.svelte';

	export let data: PageData;
	$: ({ accounts } = data);

	const daySelected = new SvelteSubject(undefined);

	const today = new Date();

	const balance$ = accounts.pipe(
		concatAll(),
		filter(({ name }) => name.includes('1880') || name.includes('1334')),
		reduce((sum, { balance }) => sum + balance, 0),
		tap(console.log)
	);

	// TODO - consider sveltequery
	const expenses$ = daySelected.pipe(
		debounceTime(150),
		switchMap((selectedDay) =>
			Buxfer.getTransactions([selectedDay]).pipe(concatAll(), combineLatestWith(of(selectedDay)))
		),
		filter(([{ type }]) => type === 'expense'),
		reduce(
			([thisMonthSpent, lastMonthSpent], [{ date, amount }, selectedDay]) => [
				thisMonthSpent + (isSameMonth(new Date(date), selectedDay || today) ? amount : 0),
				lastMonthSpent + (isSameMonth(new Date(date), sub(selectedDay || today, { months: 1 })) ? amount : 0),
			],
			[0, 0]
		),
		tap(console.log)
	);
</script>

<svelte:head>
	<title>Financial Dashboard</title>
	<meta name="description" content="FinanseerOps" />
</svelte:head>

<div class="mx-auto max-w-md px-4 sm:mx-0 sm:px-7 md:max-w-4xl md:px-6">
	<div class="md:grid md:grid-cols-2 md:divide-x md:divide-neutral-200 md:dark:divide-neutral-600">
		<DateSelect bind:selectedDay={$daySelected} />
		<section class="mt-12 flex flex-row flex-wrap items-center justify-center gap-4 md:mt-0 md:justify-start md:pl-14">
			{#await lastValueFrom(combineLatest([balance$, expenses$]).pipe(take(1)))}
				<ScoreCard label="Balance" score={undefined} delay={0} />
				<ScoreCard label="Spent" score={undefined} delay={1} />
				<ScoreCard label="Forecast" score={undefined} delay={2} />
			{:then [balance, [currMonthSpent, prevMonthSpent]]}
				<ScoreCard label="Balance" score={balance} />
				<ScoreCard label="Spent" score={currMonthSpent} comparison={{ score: prevMonthSpent, swap: true }} />
				<ScoreCard label="Forecast" score={balance - currMonthSpent} />
			{/await}
		</section>
	</div>
</div>
