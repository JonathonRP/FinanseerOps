export function today() {
	return Temporal.Now.plainDate(Temporal.Now.timeZoneId());
}

export function startOfToday() {
	return Temporal.Now.plainDateTime(Temporal.Now.timeZoneId()).with({
		hour: 0,
		minute: 0,
		second: 0,
		millisecond: 0,
	});
}
