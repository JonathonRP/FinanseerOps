export function startOfWeek(date: Temporal.PlainDate) {
	return date.subtract({ days: date.daysInWeek - date.dayOfWeek });
}
