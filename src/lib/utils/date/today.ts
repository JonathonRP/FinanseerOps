export function today() {
	return Temporal.Now.plainDateISO();
}

export function startOfToday() {
	return Temporal.Now.zonedDateTime(new Intl.DateTimeFormat().resolvedOptions().calendar)
		.withTimeZone(Temporal.Now.timeZoneId())
		.startOfDay();
}
