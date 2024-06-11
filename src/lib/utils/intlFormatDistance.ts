export function intlFormatDistance(date: Temporal.PlainDate, baseDate: Temporal.PlainDate | string) {
	const distance = (baseDate instanceof Temporal.PlainDate ? baseDate : Temporal.PlainDate.from(baseDate)).until(
		Temporal.PlainDate.from(date),
		{ largestUnit: 'year' }
	);
	const units = distance.years ? 'years' : distance.months ? 'months' : distance.days ? 'days' : 'hours';
	return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(distance[units], units);
}
