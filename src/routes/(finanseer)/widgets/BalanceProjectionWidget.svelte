<svelte:options runes={true} />
<script lang="ts">
	import type { ForwardMotionProps } from '$lib/animations';
	import { from, filter, reduce, combineLatest, switchMap, of } from 'rxjs';
	import { addDays, startOfMonth } from 'date-fns';
	import { api } from '$lib/api';
	import { Score } from '../score';
	import DashboardWidget from '../DashboardWidget.svelte';

	const { processedDay, ...motion } = $props<{processedDay: Date} & ForwardMotionProps>();

	const accounts = $derived(api.buxfer.accounts.query());

	const balance$ = $derived(from($accounts.data ?? []).pipe(
		filter(({ name }) => name.includes('1880') || name.includes('1334')),
		reduce((sum, { balance }) => sum + balance, 0)
	));

	const transactions = $derived(api.buxfer.transactions.infiniteQuery(
		{
			startDate: addDays(startOfMonth(processedDay), 1),
			endDate: addDays(processedDay, 1),
		},
		{
			initialPageParam: 1,
			getNextPageParam: (lastPage, allPages) => {
				if (
					lastPage &&
					typeof lastPage === 'object' &&
					'totalTransactionsCount' in lastPage &&
					typeof lastPage.totalTransactionsCount === 'number' &&
					allPages.length < Math.ceil(lastPage.totalTransactionsCount / 100)
				) {

					return allPages.length + 1;
				}
				return undefined;
			}
		}
	));

	const expenses$ = $derived(of($transactions.data).pipe(
		switchMap((data) => from(data?.pages.flatMap((page) => page.transactions) ?? [])),
		filter(({ type }) => type === 'expense'),
		reduce((acc, { amount }) => acc + amount, 0)
	));

	const forcast$ = $derived(combineLatest([balance$, expenses$]).pipe(reduce((acc, [bal, exp]) => bal - exp, 0)));

	$effect(() => {
		if ($transactions.status === 'success' && $transactions.hasNextPage) {
			$transactions.fetchNextPage();
		}
	});
</script>

<DashboardWidget {motion}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Forecast</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric value={$forcast$} />
		</Score.Content>
	</Score.Root>
</DashboardWidget>