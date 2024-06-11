export function endOfYear(date: Temporal.PlainDate | Temporal.PlainYearMonth) {
	return (date instanceof Temporal.PlainDate ? date.toPlainYearMonth() : date)
		.with({ month: 12 })
		.toPlainDate({ day: date.daysInMonth });
}
