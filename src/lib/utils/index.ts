import { dev } from '$app/environment';
import { TRPCClientError } from '@trpc/client';
import { TRPCError } from '@trpc/server';
import { ZodError } from 'zod';

export { default as accordion } from './accordion';
export { datePeriods, eachDay, eachDayInWeek, endOfMonth, endOfWeek, startOfMonth, startOfWeek, today } from './date';
export { default as form } from './form';
export { intlFormatDistance } from './intlFormatDistance';
export const compareDates = Temporal.PlainDate.compare;
export const compareMonths = Temporal.PlainYearMonth.compare;

export type { Color } from './Color';
export { cn } from './cn';
export { cubicBezier as cubic_bezier } from './cubic-bezier';
export { flyAndScale } from './flyAndScale';
export { merge } from './merge';
export { SvelteSubject } from './svelteSubject';

export const numberFormat = (
	locale: string | string[] | undefined = undefined,
	currency: Intl.NumberFormatOptions['currency'] = 'USD'
) => Intl.NumberFormat(locale, { style: 'currency', currency, notation: 'compact' });

export const formatError = (error: unknown): App.Error => {
	if (
		dev &&
		(error instanceof TRPCError || error instanceof TRPCClientError || error instanceof Error) &&
		error.stack
	) {
		if (error.cause && error.cause instanceof ZodError) {
			const fields = Object.keys(error.cause.flatten().fieldErrors);
			const { cause } = error;
			return {
				...{
					cause: fields.length
						? [
								...fields.map((field) => ({
									[field]: (cause.format() as unknown as { [x: string]: { _errors: string[] } })[field],
								})),
							]
						: [...cause.issues],
				},
				message: fields.length
					? fields.map((field) => `${cause.flatten().fieldErrors[field]} ${field}`).join(', ')
					: cause.issues.map((issue, indx) => `${issue.message} arg${++indx}`).join(', '),
				code: (error as TRPCError)?.code || undefined,
			};
		}

		return {
			message: error?.message ?? 'Whoops',
		};
	}

	return error as App.Error;
};

export function returnTo(url: URL, after: `/${string}`, reason?: string) {
	const match = /^\/.*$/.exec(after);
	if (!match) throw new TypeError('must redirect to current origin path');
	const { pathname, search } = url;
	const redirectTo = `${pathname}${search}`;
	return `${after}?${new URLSearchParams({ redirectTo, reason: reason ?? '' }).toString()}`;
}

export function ensureLoggedIn(url: URL, redirectReason?: string) {
	const loginEndpoint = '/auth';
	return returnTo(url, loginEndpoint, redirectReason);
}

export function bearer(token: string) {
	return `Bearer: ${token}`;
}

export function AuthorizationHeadersBearerTokenFrom(token: string) {
	return { Authorization: bearer(token) };
}
