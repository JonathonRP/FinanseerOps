export function startOfMonth(date: Temporal.PlainDate | Temporal.PlainYearMonth) {
	return (date instanceof Temporal.PlainDate ? date.toPlainYearMonth() : date).toPlainDate({ day: 1 });
}
