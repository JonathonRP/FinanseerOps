export function startOfWeek(date: Temporal.PlainDate) {
	return date.subtract({
		days: date.dayOfWeek === 1 ? 0 : date.dayOfWeek - 1,
	});
}
