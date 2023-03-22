<script lang="ts">
	import { isThisMonth, sub } from 'date-fns';
	import { switchMap, filter, reduce, lastValueFrom, concatAll, combineLatest, debounceTime } from 'rxjs';
	import { SvelteSubject } from '$lib/utils';
	import { Buxfer } from '$lib/stores/buxfer';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import DateSelect from './DateSelect.svelte';
	import ScoreCard from './ScoreCard.svelte';

	export let data: PageData;
	const { accounts } = data;

	const daySelected = new SvelteSubject(undefined);

	const today = new Date();

	const balance$ = accounts.pipe(
		concatAll(),
		filter(({ name }) => name.includes('1880') || name.includes('1334')),
		reduce((sum, { balance }) => sum + balance, 0)
	);

	const expenses$ = daySelected.pipe(
		debounceTime(150),
		switchMap((selectedDay) => Buxfer($page).getTransactions([selectedDay]).pipe(concatAll())),
		filter(({ type }) => type === 'expense')
	);

	const spent$ = combineLatest([daySelected, expenses$]).pipe(
		filter(([selectedDay, { date }]) => isThisMonth(new Date(date)) && new Date(date) < (selectedDay || today)),
		reduce((sum, [, { amount }]) => sum + amount, 0)
	);
	const prevMonthSpent$ = combineLatest([daySelected, expenses$]).pipe(
		filter(([selectedDay, { date }]) => new Date(date) <= sub(selectedDay || today, { months: 1 })),
		reduce((sum, [, { amount }]) => sum + amount, 0)
	);
</script>

<svelte:head>
	<title>Financial Dashboard</title>
	<meta name="description" content="Personal Finance Dashboard" />
</svelte:head>

<div class="mx-auto max-w-md px-4 sm:mx-0 sm:px-7 md:max-w-4xl md:px-6">
	<div class="md:grid md:grid-cols-2 md:divide-x md:divide-neutral-200 md:dark:divide-neutral-600">
		<DateSelect bind:selectedDay={$daySelected} />
		<section class="mt-12 flex flex-row flex-wrap items-center justify-center gap-4 md:mt-0 md:justify-start md:pl-14">
			{#await lastValueFrom(combineLatest([balance$, spent$, prevMonthSpent$]))}
				<ScoreCard label="Balance" score={undefined} delay={0} />
				<ScoreCard label="Spent" score={undefined} delay={1} />
				<ScoreCard label="Forecast" score={undefined} delay={2} />
			{:then [balance, spent, prevMonthSpent]}
				<ScoreCard label="Balance" score={balance} />
				<ScoreCard label="Spent" score={spent} comparison={{ score: prevMonthSpent, swap: true }} />
				<ScoreCard label="Forecast" score={balance - spent} />
			{/await}
		</section>
	</div>
</div>
