import type { ComponentType } from 'svelte';
import TotalMonthExpense from '../components/dashboardWidgets/widgets/totalMonthExpenseWidget.svelte';
import Balance from '../components/dashboardWidgets/widgets/balanceWidget.svelte';
import BalanceProjection from '../components/dashboardWidgets/widgets/balanceProjectionWidget.svelte';

export const widgets = new Map<string, ComponentType>([
	['balance', Balance],
	['spent', TotalMonthExpense],
	['forecast', BalanceProjection],
]);
