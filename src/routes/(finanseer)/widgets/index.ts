import balance from './BalanceWidget.svelte';
import budget from './BudgetGaugeWidget.svelte';
import spent from './TotalMonthExpenseWidget.svelte';
import forecast from './BalanceProjectionWidget.svelte';
import MonthlyExpenseAreaWidget from './MonthlyExpenseAreaWidget.svelte';

export const defaultWidgets = { balance, forecast, budget, spent };
export const denseWidgets = {
	...defaultWidgets,
	...{ spent: MonthlyExpenseAreaWidget },
};
