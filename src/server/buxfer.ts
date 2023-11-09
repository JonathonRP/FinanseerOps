import { error, type HttpError } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import path from 'path';
import { array, number, object, string, union, z, never, coerce, date } from 'zod';
import { timezone } from '$lib/stores/userTimezone';
import jwt from 'jsonwebtoken';
import { ulid } from 'ulid';
import { logger } from './logger';
import { SECRET } from '$env/static/private';

const DateFormat = 'yyyy-MM-dd';

type BuxferResponse = {
	response: BuxferData;
	error?: BuxferError;
};

type BuxferData = z.infer<typeof buxferResponse>;

type BuxferError = {
	type: string;
	message: string;
};

export const buxferToken = string();

export const buxferAccounts = array(
	object({
		id: number(),
		name: string(),
		bank: string(),
		balance: number(),
	})
);

export const buxferTransactions = object({
	totalTransactionsCount: coerce
		.number()
		.default(0)
		.optional()
		.transform((count) => count ?? 0),
	transactions: array(
		object({
			id: number(),
			description: string(),
			date: string()
				.or(date())
				.transform((arg) => zonedTimeToUtc(arg, get(timezone) || 'UTC')),
			type: string(),
			amount: number(),
			accountId: number(),
			tags: string(),
		})
	),
});

const tokenResponse = object({
	token: string(),
	accounts: never().optional(),
	numTransactions: never().optional(),
	transactions: never().optional(),
});

const accountsResponse = object({
	token: never().optional(),
	accounts: array(
		object({
			id: number(),
			description: string(),
			date: string(),
			type: string(),
			amount: number(),
			accountId: number(),
			tags: string(),
		})
	),
	numTransactions: never().optional(),
	transactions: never().optional(),
});

const transactionsResponse = object({
	token: never().optional(),
	accounts: never().optional(),
	numTransactions: string(),
	transactions: array(
		object({
			id: number(),
			description: string(),
			date: string(),
			type: string(),
			amount: number(),
			accountId: number(),
			tags: string(),
		})
	),
});

const buxferResponse = union([tokenResponse, accountsResponse, transactionsResponse]);

export const buxferLogin = object({
	email: string(),
	password: string(),
});

export const buxferTransactionsQuery = object({
	startDate: date().transform((arg) => format(arg, DateFormat)),
	endDate: date().transform((arg) => format(arg, DateFormat)),
	cursor: number().nullish().default(1).pipe(coerce.string()),
}).transform((o) => ({ startDate: o.startDate, endDate: o.endDate, page: o.cursor }));

const prefix = 'api';

const api = {
	login: '/login',
	accounts: '/accounts',
	transactions: '/transactions',
} as const;

const routes = new Map<string, string>([
	[api.login, path.join(prefix, api.login)],
	[api.accounts, path.join(prefix, api.accounts)],
	[api.transactions, path.join(prefix, api.transactions)],
]);

const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

const BuxferDomain = 'https://www.buxfer.com';

const buxferProxy = async (
	endpoint: (typeof api)[keyof typeof api],
	body:
		| z.infer<typeof buxferLogin>
		| (z.infer<typeof buxferTransactionsQuery> & { token: z.infer<typeof buxferToken> })
		| { token: z.infer<typeof buxferToken> }
) => {
	const buxferConfig = {
		method: 'POST',
		headers: {
			...headers,
		},
		body: new URLSearchParams(body),
	} as RequestInit;

	const rerouteURL = new URL(routes.get(endpoint) ?? <never>null, BuxferDomain);
	const request = new Request(rerouteURL, buxferConfig);

	try {
		const resp = await fetch(request);

		if (!resp.ok)
			// eslint-disable-next-line @typescript-eslint/no-throw-literal
			throw error(resp.status, {
				code: ulid(),
				message: ((await resp.json()) as BuxferResponse).error?.message || '',
			});

		const { response } = <BuxferResponse>await resp.json();
		return response;
	} catch (e) {
		const err = e as HttpError;
		// TODO - replace with logging collection data service (ex. Sentry).
		logger.error('fetchError: ', err);

		if (err.status === 400 && err.body.message === 'Access denied. Please login first.')
			throw error(401, 'Unauthorized');
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw error(err.status || 500, err.body);
	}
};

type BuxferRequest =
	| { url: typeof api.login; body: z.infer<typeof buxferLogin> }
	| { url: typeof api.accounts; body: null | undefined }
	| { url: typeof api.transactions; body: z.infer<typeof buxferTransactionsQuery> };

// Promise<
// 	typeof url extends typeof api.login
// 		? string
// 		: typeof url extends typeof api.accounts
// 		? z.infer<typeof buxferAccounts>
// 		: typeof url extends typeof api.transactions
// 		? z.infer<typeof buxferTransactions>
// 		: never
// >
export async function BuxferClient<T extends Extract<BuxferRequest, { url: typeof api.login }>>(
	url: T['url'],
	body: T['body'],
	options?: { headers: Headers } | null | undefined
): Promise<string>;
export async function BuxferClient<T extends Extract<BuxferRequest, { url: typeof api.accounts }>>(
	url: T['url'],
	body: T['body'],
	options?: { headers: Headers } | null | undefined
): Promise<z.infer<typeof buxferAccounts>>;
export async function BuxferClient<T extends Extract<BuxferRequest, { url: typeof api.transactions }>>(
	url: T['url'],
	body: T['body'],
	options?: { headers: Headers } | null | undefined
): Promise<z.infer<typeof buxferTransactions>>;
export async function BuxferClient<T extends BuxferRequest>(
	url: T['url'],
	body: T['body'],
	options?: { headers: Headers } | null | undefined
) {
	switch (url) {
		case api.login: {
			const claims = jwt.verify(options?.headers?.get('Authorization')?.replace('Bearer: ', '') ?? '', SECRET);
			if (claims) {
				return jwt.sign(claims, SECRET, { expiresIn: 10 });
			}
			const { token: refreshedToken } = await buxferProxy(url, buxferLogin.parse(body));
			return jwt.sign(buxferToken.parse(refreshedToken), SECRET, { expiresIn: 10 });
		}

		case api.accounts: {
			const claims = jwt.verify(options?.headers?.get('Authorization')?.replace('Bearer: ', '') ?? '', SECRET);
			if (!claims) {
				throw error(401, 'Unathorized');
			}
			const { accounts } = await buxferProxy(url, { token: buxferToken.parse(claims) });
			return buxferAccounts.parse(accounts);
		}

		case api.transactions: {
			const claims = jwt.verify(options?.headers?.get('Authorization')?.replace('Bearer: ', '') ?? '', SECRET);
			if (!claims) {
				throw error(401, 'Unathorized');
			}
			const { numTransactions: totalTransactionsCount, transactions } = await buxferProxy(url, {
				...buxferTransactionsQuery.parse({
					...body,
				}),
				token: buxferToken.parse(claims),
			});

			return buxferTransactions.parse({ transactions, totalTransactionsCount });
		}
		default:
			assertCannotReach(url);
	}
	return <never>null;
}

function assertCannotReach(x: never) {
	throw new Error('cannot reach this place in the code');
}
