import { eachDay } from './eachDay';
import { endOfWeek } from './endOfWeek';
import { startOfWeek } from './startOfWeek';

export function eachDayInWeek({ weekOfYear, yearOfWeek }: { weekOfYear: number; yearOfWeek: number }) {
	const firstWeekOfYear = Temporal.PlainYearMonth.from({ year: yearOfWeek, month: 1 }).toPlainDate({ day: 4 });
	const start = startOfWeek(firstWeekOfYear).add({ weeks: weekOfYear - 1 });
	const end = endOfWeek(Temporal.PlainDate.from(start));
	return eachDay({ start, end });
}
