<svelte:options runes={true} />

<script lang="ts">
	import { charts as chartIcons } from '$/icons';
	import { Select } from '$/lib/components/ui/select';
	import { compareDates, compareMonths } from '$/lib/utils';
	import { page } from '$app/stores';
	import { scaleOrdinal } from 'd3-scale';
	import { schemeTableau10 } from 'd3-scale-chromatic';
	import { combineLatest, concatAll, from, groupBy, map, mergeMap, reduce, toArray } from 'rxjs';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { RadarChart, RadialChart } from '../charts';
	import { Score } from '../score';

	const { processedDay, bankTransactions } = $derived($page.data);

	const charts = new Map([
		['radial', { icon: chartIcons.RadialIcon, chart: RadialChart, label: 'Radial' }],
		['radar', { icon: chartIcons.RadarIcon, chart: RadarChart, label: 'Radar' }],
	]);

	const expenses = $derived(
		from(bankTransactions).pipe(
			map((result) =>
				result.filter(
					({ date, type }) =>
						compareMonths(date, processedDay) === 0 && compareDates(date, processedDay) <= 0 && type === 'expense'
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
			groupBy(({ tags }) => tags, { element: (p) => p.amount }),
			mergeMap((group$) => group$.pipe(reduce((acc, curr) => [...acc, curr.toString()], [`${group$.key}`]))),
			map(([category, ...group$]) =>
				group$.reduce((acc, curr) => ({ category, amount: acc.amount + parseInt(curr, 10) }), {
					category: '',
					amount: 0,
				})
			),
			toArray()
		)
	);

	const data$ = $derived(
		combineLatest([categories, monthExpenseTotal]).pipe(
			map(([categories$, monthExpenseTotal$]) => {
				const color = scaleOrdinal(schemeTableau10)
					.domain(categories$?.map(({ category }) => category))
					.range(schemeTableau10);
				return categories$.map(({ category, amount: spent }) => ({
					value: Math.round((spent / monthExpenseTotal$) * 100),
					label: category.split('/').at(-1).trim(),
					seriesColor: color(category),
				}));
			})
		)
	);

	let selectedChart = $state('radial');
</script>

<DashboardWidget>
	<Score.Root>
		<Score.Header class="flex flex-col justify-between space-y-2 xl:flex-row xl:items-start xl:space-y-0 xl:pr-3">
			<Score.Label>Categories</Score.Label>
			<Select.Root
				selected={{ label: charts.get(selectedChart)?.label, value: charts.get(selectedChart) }}
				onSelectedChange={({ value }) => {
					selectedChart = value;
				}}>
				<Select.Trigger class="h-9 rounded-md bg-transparent px-3 xl:w-auto">
					<svelte:component this={charts.get(selectedChart)?.icon} class="mr-2 size-5" />
					<Select.Value placeholder="chart type" />
				</Select.Trigger>
				<Select.Content>
					{#each charts as [value, { icon, label }], indx (indx)}
						<Select.Item {value} class="pl-2">
							<svelte:component this={icon} class="mr-2 size-4" />
							{label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</Score.Header>
		<Score.Content>
			<svelte:component this={charts.get(selectedChart)?.chart} data={$data$} class="fill-foreground" />
		</Score.Content>
	</Score.Root>
</DashboardWidget>
