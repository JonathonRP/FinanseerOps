import { TRPCClientError } from '@trpc/client';
import { TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import { dev } from '$app/environment';

export { default as accordion } from './accordion';
export { default as form } from './form';

export type { Color } from './Color';
export { merge } from './merge';
export { SvelteSubject } from './svelteSubject';
export { cubicBezier as cubic_bezier } from './cubic-bezier';
export { cn } from './cn';

export const dateFormat = 'MM/dd/yyyy';

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
	// TODO - why is this happening "redirect="uri"&"query""&reason?
	const { pathname, search } = url;
	const redirectTo = `${pathname}${search}`;
	return `${after}?${new URLSearchParams({ redirectTo, reason: reason ?? '' }).toString()}`;
}

export function ensureLoggedIn(url: URL, redirectReason?: string) {
	const loginEndpoint = '/auth';
	return returnTo(url, loginEndpoint, redirectReason);
}

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
