export function startOfMonth(date: Temporal.PlainDate) {
	return date.toPlainYearMonth().toPlainDate({ day: 1 });
}
