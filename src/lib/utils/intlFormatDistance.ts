export function intlFormatDistance(date: Temporal.PlainDate, baseDate: Temporal.PlainDate) {
	const distance = baseDate.until(Temporal.PlainDate.from(date), { largestUnit: 'year' });
	const units = distance.years ? 'years' : distance.months ? 'months' : distance.days ? 'days' : 'hours';
	return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(distance[units], units);
}
