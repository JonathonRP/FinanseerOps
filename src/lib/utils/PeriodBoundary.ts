export const PeriodBoundaries = ['start', 'end'] as const;
export type PeriodBoundary = (typeof PeriodBoundaries)[number];
