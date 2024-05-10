import type { DefaultPropsType as DefaultComponentProps } from '$lib/components';
import balance from './BalanceWidget.svelte';
import budget from './BudgetGaugeWidget.svelte';
import spent from './TotalMonthExpenseWidget.svelte';
import forecast from './BalanceProjectionWidget.svelte';
import income from './TotalMonthIncomeWidget.svelte';
import categories from './CategoriesGaugeWidget.svelte';
import MonthlyExpenseAreaWidget from './MonthlyExpenseAreaWidget.svelte';
import MonthlyIncomeAreaWidget from './MonthlyIncomeAreaWidget.svelte';

export type DefaultPropsType = Pick<DefaultComponentProps, 'class'>;

export const defaultWidgets = { balance, forecast, budget, spent, income, categories };
export const denseWidgets = {
	...defaultWidgets,
	...{ spent: MonthlyExpenseAreaWidget, income: MonthlyIncomeAreaWidget },
};
