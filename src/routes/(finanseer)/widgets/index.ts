import balance from './BalanceWidget.svelte';
import budget from './BudgetGaugeWidget.svelte';
import spent from './TotalMonthExpenseWidget.svelte';
import forcast from './BalanceProjectionWidget.svelte';
import MonthlyExpenseAreaWidget from './MonthlyExpenseAreaWidget.svelte';

export const defaultWidgets = { budget, spent, balance, forcast };
export const adminWidgets = {
	...defaultWidgets,
	// ...{ spent: MonthlyExpenseAreaWidget }
};
