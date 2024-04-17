<svelte:options runes={true} />

<script lang="ts">
	import { from, map } from 'rxjs';
	import { Score } from '../score';
	import DashboardWidget from '../DashboardWidget.svelte';
	import { page } from '$app/stores';
	import type { DefaultPropsType } from '.';

	const { class: className }: DefaultPropsType = $props();
	const { accounts, user } = $derived($page.data);

	const balance = $derived.by(() => {
		const filter = user.permittedBankAccounts;
		return from(accounts).pipe(
			map((data) =>
				data.filter(({ id }) => filter?.includes(id) ?? true).reduce((sum, { balance }) => sum + balance, 0)
			)
		);
	});
</script>

<DashboardWidget class={className}>
	<Score.Root>
		<Score.Header>
			<Score.Label>Balance</Score.Label>
		</Score.Header>
		<Score.Content>
			<Score.Metric value={$balance} />
		</Score.Content>
	</Score.Root>
</DashboardWidget>
