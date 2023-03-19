<script lang="ts">
	import { isThisMonth, sub } from 'date-fns';
	import { filter, reduce, lastValueFrom, concatAll, combineLatest } from 'rxjs';
	import type { PageData } from './$types';
	import DateSelect from './DateSelect.svelte';
	import ScoreCard from './ScoreCard.svelte';

	export let data: PageData;
	const { accounts, transactions } = data;

	let selectedDay: Date = new Date();

	const balance$ = accounts.pipe(
		concatAll(),
		filter(({ name }) => name.includes('1880') || name.includes('1334')),
		reduce((sum, { balance }) => sum + balance, 0)
	);
	const expenses$ = transactions.pipe(
		concatAll(),
		filter(({ type }) => type === 'expense')
	);
	const currentExpenses$ = expenses$.pipe(
		filter(({ date }) => isThisMonth(new Date(date)) && new Date(date) < selectedDay),
		reduce((sum, { amount }) => sum + amount, 0)
	);
	const lastMonthExpenses$ = expenses$.pipe(
		filter(({ date }) => new Date(date) <= sub(selectedDay, { months: 1 })),
		reduce((sum, { amount }) => sum + amount, 0)
	);

	balance$.subscribe({ next: (value) => console.log(value), complete: () => console.log('balances completed') });
	currentExpenses$.subscribe({ next: (value) => console.log(value), complete: () => console.log('current completed') });
	lastMonthExpenses$.subscribe({
		next: (value) => console.log(value),
		complete: () => console.log('last month completed'),
	});

	const financeData$ = combineLatest([balance$, currentExpenses$, lastMonthExpenses$]);
</script>

<svelte:head>
	<title>Financial Dashboard</title>
	<meta name="description" content="Personal Finance Dashboard" />
</svelte:head>

<div class="mx-auto max-w-md px-4 sm:mx-0 sm:px-7 md:max-w-4xl md:px-6">
	<div class="md:grid md:grid-cols-2 md:divide-x md:divide-neutral-200 md:dark:divide-neutral-600">
		<DateSelect bind:selectedDay />
		<section class="mt-12 flex flex-row flex-wrap items-center justify-center gap-4 md:mt-0 md:justify-start md:pl-14">
			{#await lastValueFrom(financeData$)}
				<ScoreCard label="Balance" score={undefined} delay={0} />
				<ScoreCard label="Spent" score={undefined} delay={1} />
				<ScoreCard label="Forecast" score={undefined} delay={2} />
			{:then [balance, currentExpenses, lastMonthExpenses]}
				<ScoreCard label="Balance" score={balance} />
				<ScoreCard label="Spent" score={currentExpenses} comparison={{ score: lastMonthExpenses, swap: true }} />
				<ScoreCard label="Forecast" score={balance - currentExpenses} />
			{/await}
		</section>
	</div>
</div>
