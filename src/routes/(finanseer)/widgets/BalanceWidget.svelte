<svelte:options runes={true} />

<script lang="ts">
	import type { ForwardMotionProps } from '$lib/animations';
	import { filter, reduce, from, switchMap } from 'rxjs';
	import { api } from '$lib/api';
	import { Score } from '../score';
	import DashboardWidget from '../DashboardWidget.svelte';

	const { ...motion } = $props<ForwardMotionProps>();

	const balance = $derived(
		from(api.buxfer.accounts.query()).pipe(
			switchMap((accountData) => accountData),
			filter(([{ name }]) => name.includes('1880') || name.includes('1334')),
			reduce((sum, [{ balance }]) => sum + balance, 0)
		)
	);
</script>

<DashboardWidget {motion}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Balance</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric value={$balance} />
		</Score.Content>
	</Score.Root>
</DashboardWidget>
