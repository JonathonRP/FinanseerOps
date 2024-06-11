export function endOfMonth(date: Temporal.PlainDate | Temporal.PlainYearMonth) {
	return (date instanceof Temporal.PlainDate ? date.toPlainYearMonth() : date).toPlainDate({ day: date.daysInMonth });
}
