<svelte:options runes={true} />
<script lang="ts">
	import type { ForwardMotionProps } from '$lib/animations';
	import { from, filter, reduce } from 'rxjs';
	import { api } from '$lib/api';
	import { Score } from '../score';
	import DashboardWidget from '../DashboardWidget.svelte';

	const { ...motion } = $props<ForwardMotionProps>();

	const accounts = $derived(api.buxfer.accounts.query());

	const balance$ = $derived(from($accounts.data ?? []).pipe(
		filter(({ name }) => name.includes('1880') || name.includes('1334')),
		reduce((sum, { balance }) => sum + balance, 0)
	));
</script>

<DashboardWidget {motion}>
	<Score.Root>
		<Score.Header>
			<Score.Label>
				Balance
			</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric value={$balance$} />
		</Score.Content>
	</Score.Root>
</DashboardWidget>
