export function endOfMonth(date: Temporal.PlainDate) {
	return date.toPlainYearMonth().toPlainDate({ day: date.daysInMonth });
}
