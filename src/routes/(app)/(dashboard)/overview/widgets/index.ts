import type { DefaultPropsType as DefaultComponentProps } from '$lib/components';
import forecast from './BalanceProjectionWidget.svelte';
import balance from './BalanceWidget.svelte';
import budget from './BudgetGaugeWidget.svelte';
import categories from './CategoriesWidget.svelte';
import MonthlyExpenseAreaWidget from './MonthlyExpenseAreaWidget.svelte';
import MonthlyIncomeAreaWidget from './MonthlyIncomeAreaWidget.svelte';
import spent from './TotalMonthExpenseWidget.svelte';
import income from './TotalMonthIncomeWidget.svelte';

export type DefaultPropsType = Pick<DefaultComponentProps, 'class'>;

export const defaultWidgets = { budget, spent, income, categories, balance, forecast };
export const denseWidgets = {
	...defaultWidgets,
	...{ spent: MonthlyExpenseAreaWidget, income: MonthlyIncomeAreaWidget },
};
