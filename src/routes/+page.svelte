<script lang="ts">
  import type {Accounts, Transactions} from '$lib/utils';
  import {isSameMonth} from 'date-fns';
  import {concatAll, filter, Observable, reduce, scan, startWith} from 'rxjs';
  import type {PageData} from './$types';
  import DateSelect from './DateSelect.svelte';
  import ScoreCard from './ScoreCard.svelte';

  export let data: PageData;

  $: ({today, accounts, transactions} = data);

  let selectedDay: Date = today;

  $: balance$ = (accounts as Observable<Accounts['accounts']>).pipe(
    concatAll(),
    filter(({name}) => name.includes('1880') || name.includes('1334')),
    scan((sum, {balance}) => sum + balance, 0),
    startWith(0)
  );
  $: currentExpenses$ = (transactions as Observable<Transactions['transactions']>).pipe(
    concatAll(),
    filter(
      ({type, date}) => type === 'expense' && isSameMonth(new Date(date), selectedDay) && new Date(date) < selectedDay
    ),
    reduce((sum, {amount}) => sum + amount, 0),
    startWith(0)
  );
  $: lastMonthExpenses$ = (transactions as Observable<Transactions['transactions']>).pipe(
    concatAll(),
    filter(({type, date}) => type === 'expense' && !isSameMonth(new Date(date), selectedDay)),
    reduce((sum, {amount}) => sum + amount, 0)
  );
</script>

<svelte:head>
  <title>Financial Dashboard</title>
  <meta name="description" content="Personal Finance Dashboard" />
</svelte:head>

<DateSelect bind:selectedDay />
<section class="flex flex-row flex-wrap items-start justify-center gap-4 pt-4 sm:justify-start">
  <ScoreCard label="Balance" score={$balance$} delay={0} />
  <ScoreCard
    label="Spent"
    score={$currentExpenses$}
    comparison={{score: $lastMonthExpenses$ - $currentExpenses$, swap: true}}
    delay={1}
  />
  <ScoreCard label="Forecast" score={$balance$ - $currentExpenses$} delay={2} />
</section>
