import balance from './BalanceWidget.svelte';
import budget from './BudgetGaugeWidget.svelte';
import spent from './TotalMonthExpenseWidget.svelte';
import forcast from './BalanceProjectionWidget.svelte';

export const defaultWidgets = { balance, budget, spent, forcast };
export const adminWidgets = { ...defaultWidgets };
