export function endOfWeek(date: Temporal.PlainDate) {
	return date.add({ days: date.daysInWeek - date.dayOfWeek });
}
