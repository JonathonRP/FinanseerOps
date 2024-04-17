<svelte:options runes={true} />

<script lang="ts">
	import {
		from,
		reduce,
		groupBy,
		combineLatest,
		map,
		concatMap,
		concatAll,
		toArray,
	} from 'rxjs';
	import { isBefore, isSameDay, isSameMonth, startOfToday } from 'date-fns';
	import * as d3 from 'd3';
	import { Score } from '../score';
	import { GaugeChart } from '../charts';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';
	import type { DefaultPropsType } from '.';

	const { class: className }: DefaultPropsType = $props();
	const { processedDate, transactions } = $derived($page.data);

	const processedDay = $derived((processedDate && new Date(processedDate)) || startOfToday());
	const expenses = $derived(
		from(transactions).pipe(
			map((result) =>
				result.filter(
					({ date, type }) =>
						isSameMonth(date, processedDay) &&
						(isBefore(date, processedDay) || isSameDay(date, processedDay)) &&
						type === 'expense'
				)
			)
		)
	);
	const monthExpenseTotal = $derived(
		expenses.pipe(map((result) => result.reduce((acc, { amount }) => acc + amount, 0)))
	);

	const categories = $derived(
		expenses.pipe(
			concatAll(),
			groupBy(({ tags }) => tags),
			concatMap((group$) =>
				group$.pipe(
					reduce((acc, cur) => ({ category: cur.tags, amount: acc.amount + cur.amount }), { category: '', amount: 0 })
				)
			),
			toArray()
		)
	);

	const color = d3
		.scaleOrdinal(d3.schemeTableau10)
		.domain($categories.map(({ category }) => category))
		.range(d3.schemeTableau10);

	const categoryPercentagesOfExpenseTotal$ = $derived(
		combineLatest([categories, monthExpenseTotal]).pipe(
			map(([categories$, monthExpenseTotal$]) =>
				categories$.map((cat) => ({
					data: Math.round((cat.amount / monthExpenseTotal$) * 100),
					seriesLabel: false,
					label: cat.category,
					seriesColor: color(cat.category),
				}))
			)
		)
	);
</script>

<DashboardWidget class={className}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Categories</Score.Label>
		</Score.Header>
		<Score.Content>
			<GaugeChart datasets={$categoryPercentagesOfExpenseTotal$} />
		</Score.Content>
	</Score.Root>
</DashboardWidget>
