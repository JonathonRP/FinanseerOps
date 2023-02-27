<script lang="ts">
	import { isThisMonth, sub } from 'date-fns';
	import { filter, reduce, lastValueFrom, from } from 'rxjs';
	import type { PageData } from './$types';
	import DateSelect from './DateSelect.svelte';
	import ScoreCard from './ScoreCard.svelte';

	export let data: PageData;

	$: ({ today, accounts, transactions } = data);

	let selectedDay: Date = today;

	$: balance$ = from(accounts).pipe(
		filter(({ name }) => name.includes('1880') || name.includes('1334')),
		reduce((sum, { balance }) => sum + balance, 0)
	);
	$: expenses$ = from(transactions).pipe(filter(({ type }) => type === 'expense'));
	$: currentExpenses$ = expenses$.pipe(
		filter(({ date }) => isThisMonth(new Date(date)) && new Date(date) < selectedDay),
		reduce((sum, { amount }) => sum + amount, 0)
	);
	$: lastMonthExpenses$ = expenses$.pipe(
		filter(({ date }) => new Date(date) <= sub(selectedDay, { months: 1 })),
		reduce((sum, { amount }) => sum + amount, 0)
	);
</script>

<svelte:head>
	<title>Financial Dashboard</title>
	<meta name="description" content="Personal Finance Dashboard" />
</svelte:head>

<DateSelect bind:selectedDay />
{#await lastValueFrom(lastMonthExpenses$)}
	<section class="flex flex-row flex-wrap items-start justify-center gap-4 pt-4 min-[474px]:justify-start">
		<ScoreCard label="Balance" score={undefined} delay={0} />
		<ScoreCard label="Spent" score={undefined} comparison={{ score: undefined, swap: true }} delay={1} />
		<ScoreCard label="Forecast" score={undefined} delay={2} />
	</section>
{:then}
	<section class="flex flex-row flex-wrap items-start justify-center gap-4 pt-4 min-[474px]:justify-start">
		<ScoreCard label="Balance" score={$balance$} />
		<ScoreCard label="Spent" score={$currentExpenses$} comparison={{ score: $lastMonthExpenses$, swap: true }} />
		<ScoreCard label="Forecast" score={$balance$ - $currentExpenses$} />
	</section>
{/await}
