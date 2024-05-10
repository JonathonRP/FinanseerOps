<svelte:options runes={true} />

<script lang="ts">
	import { from, reduce, groupBy, combineLatest, map, concatMap, concatAll, toArray, mergeMap } from 'rxjs';
	import * as d3 from 'd3';
	import { Score } from '../score';
	import { GaugeChart } from '../charts';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';
	import type { DefaultPropsType } from '.';
	import { today } from '$/lib/utils';

	const { class: className }: DefaultPropsType = $props();
	const { processedDate, bankTransactions } = $derived($page.data);

	const processedDay = $derived(processedDate ? Temporal.PlainDate.from(processedDate) : today());
	const expenses = $derived(
		from(bankTransactions).pipe(
			map((result) =>
				result.filter(
					({ date, type }) =>
						date.toPlainYearMonth() === processedDay.toPlainYearMonth() && date <= processedDay && type === 'expense'
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
			mergeMap((group$) => group$.pipe(reduce((acc, cur) => [...acc, cur], <any>[])))
			// concatMap((group$) =>
			// 	group$.
			// 		reduce((acc, cur) => ({ category: cur.tags, amount: acc.amount + cur.amount }), { category: '', amount: 0 })
			// ),
			// toArray()
		)
	);

	const categoryPercentagesOfExpenseTotal$ = $derived(
		combineLatest([categories, monthExpenseTotal]).pipe(
			map(([categories$, monthExpenseTotal$]) => {
				const color = d3
					.scaleOrdinal(d3.schemeTableau10)
					.domain(categories$?.map(({ tags }) => tags))
					.range(d3.schemeTableau10);
				return categories$.map((category) => ({
					main: false,
					value: Math.round((category.amount / monthExpenseTotal$) * 100),
					label: category.tags,
					seriesColor: color(category.tags),
				}));
			})
		)
	);

	$inspect($categories);
</script>

<DashboardWidget class={className}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Categories</Score.Label>
		</Score.Header>
		<Score.Content>
			<GaugeChart data={$categoryPercentagesOfExpenseTotal$} />
		</Score.Content>
	</Score.Root>
</DashboardWidget>
