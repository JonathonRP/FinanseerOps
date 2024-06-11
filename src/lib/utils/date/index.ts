import { endOfMonth } from './endOfMonth';
import { endOfWeek } from './endOfWeek';
import { endOfYear } from './endOfYear';
import { startOfMonth } from './startOfMonth';
import { startOfWeek } from './startOfWeek';
import { startOfYear } from './startOfYear';
import { today } from './today';

export { eachDay } from './eachDay';
export { eachDayInWeek } from './eachDayInWeek';

export const datePeriods = new Map<string, { from: Temporal.PlainDate; to: Temporal.PlainDate }>([
	['this year', { from: startOfYear(today()), to: endOfYear(today()) }],
	['last year', { from: startOfYear(today().subtract({ years: 1 })), to: endOfYear(today().subtract({ years: 1 })) }],
	['last 3 months', { from: startOfMonth(today().subtract({ months: 3 })), to: today() }],
	['last 6 months', { from: startOfMonth(today().subtract({ months: 6 })), to: today() }],
	['this month', { from: startOfMonth(today()), to: endOfMonth(today()) }],
	[
		'last month',
		{ from: startOfMonth(today().subtract({ months: 1 })), to: endOfMonth(today().subtract({ months: 1 })) },
	],
	['this week', { from: startOfWeek(today()), to: endOfWeek(today()) }],
	['last week', { from: startOfWeek(today().subtract({ weeks: 1 })), to: endOfWeek(today().subtract({ weeks: 1 })) }],
]);

export { endOfMonth, endOfWeek, startOfMonth, startOfWeek, today };
