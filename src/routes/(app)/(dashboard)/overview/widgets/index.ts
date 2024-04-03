import type { DefaultPropsType as DefaultComponentProps } from '$lib/components';
import balance from './BalanceWidget.svelte';
import budget from './BudgetGaugeWidget.svelte';
import spent from './TotalMonthExpenseWidget.svelte';
import forecast from './BalanceProjectionWidget.svelte';
import MonthlyExpenseAreaWidget from './MonthlyExpenseAreaWidget.svelte';

export type DefaultPropsType = Pick<DefaultComponentProps, 'class'>;

export const defaultWidgets = { balance, forecast, budget, spent };
export const denseWidgets = {
	...defaultWidgets,
	...{ spent: MonthlyExpenseAreaWidget },
};
