import { TRPCClientError } from '@trpc/client';
import { TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import { dev } from '$app/environment';
import { userSettings } from '../stores/userSettings.svelte';

export { default as accordion } from './accordion';
export { default as form } from './form';

export type { Color } from './Color';
export { merge } from './merge';
export { SvelteSubject } from './svelteSubject';
export { cubicBezier as cubic_bezier } from './cubic-bezier';
export { cn } from './cn';

export const dateFormat = 'MM/dd/yyyy';

export const numberFormat = (
	locale: string | string[] | undefined = userSettings.locale,
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
