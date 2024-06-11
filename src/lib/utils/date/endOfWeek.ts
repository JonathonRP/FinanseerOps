export function endOfWeek(date: Temporal.PlainDate) {
	return date.add({
		days: date.dayOfWeek === 7 ? 0 : date.daysInWeek - (date.dayOfWeek - 1),
	});
}
