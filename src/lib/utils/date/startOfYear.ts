export function startOfYear(date: Temporal.PlainDate | Temporal.PlainYearMonth) {
	return (date instanceof Temporal.PlainDate ? date.toPlainYearMonth() : date)
		.with({ month: 1 })
		.toPlainDate({ day: 1 });
}
