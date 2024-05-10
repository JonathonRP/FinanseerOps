function* eachDay({ start }: { start: Temporal.PlainDate }): Generator<Temporal.PlainDate> {
	for (let date = start; ; date = date.add({ days: 1 })) {
		yield date;
	}
}
function eachIntervalDay({
	start,
	end,
}: {
	start: Temporal.PlainDate;
	end?: Temporal.PlainDate;
}): Temporal.PlainDate[] {
	const distance = start.until(end ?? start, { largestUnit: 'days' }).days;
	return Array(distance)
		.fill(0)
		.map(() => eachDay({ start }).next().value);
}

export { eachIntervalDay as eachDay };
