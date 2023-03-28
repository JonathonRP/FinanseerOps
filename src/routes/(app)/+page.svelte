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
	} from 'rxjs';
	import { SvelteSubject } from '$lib/utils';
	import { Buxfer } from '$lib/stores/buxfer';
	import { page } from '$app/stores';
	import ScoreCard from './ScoreCard.svelte';

	export let data;
	$: ({ accounts } = data);

	const daySelected = new SvelteSubject<Date | undefined>(undefined);
	$: day = $page.url.searchParams.get('selectedDay');
	$: if (day) {
		$daySelected = new Date(day);
	}

	const today = new Date();

	$: balance$ = accounts.pipe(
		concatAll(),
		filter(({ name }) => name.includes('1880') || name.includes('1334')),
		reduce((sum, { balance }) => sum + balance, 0)
	);

	// TODO - consider sveltequery
	$: expenses$ = daySelected.pipe(
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
		)
	);
</script>

<svelte:head>
	<title>Finanseer Ops</title>
	<meta name="description" content="FinanseerOps" />
</svelte:head>

{#await lastValueFrom(combineLatest([balance$, expenses$]).pipe(take(1)))}
	<ScoreCard label="Balance" score={undefined} delay={0} />
	<ScoreCard label="Spent" score={undefined} delay={1} />
	<ScoreCard label="Forecast" score={undefined} delay={2} />
{:then [balance, [currMonthSpent, prevMonthSpent]]}
	<ScoreCard label="Balance" score={balance} />
	<ScoreCard label="Spent" score={currMonthSpent} comparison={{ score: prevMonthSpent, swap: true }} />
	<ScoreCard label="Forecast" score={balance - currMonthSpent} />
{/await}
