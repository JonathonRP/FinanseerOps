<svelte:options runes={true} />

<script lang="ts">
	import { from, map } from 'rxjs';
	import { Score } from '../score';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';
	import type { DefaultPropsType } from '.';

	const { class: className }: DefaultPropsType = $props();
	const { bankAccounts } = $derived($page.data);

	const balance = $derived.by(() => {
		return from(bankAccounts).pipe(map((data) => data.reduce((sum, { balance }) => sum + balance, 0)));
	});
</script>

<DashboardWidget class={className}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Balance</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric value={$balance}></Score.Metric>
		</Score.Content>
	</Score.Root>
</DashboardWidget>
