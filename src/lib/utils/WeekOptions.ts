export const WeekDays = [
	{ Sunday: 0 },
	{ Monday: 1 },
	{ Tuesday: 2 },
	{ Wednesday: 3 },
	{ Thursday: 4 },
	{ Friday: 5 },
	{ Saturday: 6 },
] as const;
export type WeekOptions = {
	local: Locale;
	weekStartsOn: Exclude<Partial<typeof WeekDays>['length'], (typeof WeekDays)['length']>;
};
