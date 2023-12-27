import { error, type HttpError } from '@sveltejs/kit';
import { format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import path from 'path';
import { array, number, object, string, union, z, never, coerce, date, discriminatedUnion, literal } from 'zod';
import { user } from '$/lib/stores/userTimezone.svelte';
import { ulid } from 'ulid';
import { logger } from './logger';

const DateFormat = 'yyyy-MM-dd';

const buxferToken = string();

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
				.transform((arg) => zonedTimeToUtc(arg, user.timezone || 'UTC')),
			type: string(),
			amount: number(),
			accountId: number(),
			tags: string(),
		})
	),
});

const tokenResponse = object({
	tokens: object({
		access: buxferToken,
		refresh: buxferToken,
	})
});

const accountsResponse = object({
	accounts: buxferAccounts,
});

const transactionsResponse = object({
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

const buxferAccessToken = object({
	token: buxferToken
})

const buxferResponse = union([tokenResponse, accountsResponse, transactionsResponse]);
const buxferError = object({
	type: string(),
	message: string()
})

const buxferApiResponse = union([
	object({ response: buxferResponse }),
	object({ error: buxferError }),
]);

export const buxferLogin = object({
	email: string(),
	password: string(),
});

export const buxferRefresh = object({
	refresh: buxferToken
})

export const buxferTransactionsQuery = object({
	startDate: date().transform((arg) => format(arg, DateFormat)),
	endDate: date().transform((arg) => format(arg, DateFormat)),
	cursor: number().nullish().default(1).pipe(coerce.string()),
}).transform((o) => ({ startDate: o.startDate, endDate: o.endDate, page: o.cursor }));

export const buxferTokens = object({
	access: buxferToken,
	refresh: buxferToken
});

const prefix = 'api';

const api = {
	login: '/login',
	refresh: '/refresh',
	accounts: '/accounts',
	transactions: '/transactions',
} as const;

const routes = new Map<string, string>([
	[api.login, path.join(prefix, api.login)],
	[api.refresh, path.join(prefix, api.refresh)],
	[api.accounts, path.join(prefix, api.accounts)],
	[api.transactions, path.join(prefix, api.transactions)],
]);

const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

const BuxferDomain = 'https://www.buxfer.com';

type BuxferProxyRequest =
	| { url: typeof api.login; body: z.infer<typeof buxferLogin> }
	| { url: typeof api.refresh; body: z.infer<typeof buxferRefresh> }
	| { url: typeof api.accounts; body: z.infer<typeof buxferAccessToken> }
	| { url: typeof api.transactions; body: z.infer<typeof buxferTransactionsQuery> & z.infer<typeof buxferAccessToken> };

type BuxferProxyResponse<T extends BuxferProxyRequest> = Promise<
	T['url'] extends typeof api.login | typeof api.refresh ? z.infer<typeof tokenResponse>
	: T['url'] extends typeof api.accounts ? z.infer<typeof accountsResponse>
	: T['url'] extends typeof api.transactions ? z.infer<typeof transactionsResponse>
	: never
>

async function buxferProxy<T extends Extract<BuxferProxyRequest, { url: typeof api.login }>>(
	endpoint: T['url'],
	body: T['body'],
): BuxferProxyResponse<T>;
async function buxferProxy<T extends Extract<BuxferProxyRequest, { url: typeof api.refresh }>>(
	endpoint: T['url'],
	body: T['body'],
): BuxferProxyResponse<T>;
async function buxferProxy<T extends Extract<BuxferProxyRequest, { url: typeof api.accounts }>>(
	endpoint: T['url'],
	body: T['body'],
): BuxferProxyResponse<T>;
async function buxferProxy<T extends Extract<BuxferProxyRequest, { url: typeof api.transactions }>>(
	endpoint: T['url'],
	body: T['body'],
): BuxferProxyResponse<T>;
async function buxferProxy (
	endpoint: (typeof api)[keyof typeof api],
	body:
		| z.infer<typeof buxferLogin>
		| (z.infer<typeof buxferTransactionsQuery> & z.infer<typeof buxferAccessToken>)
		| z.infer<typeof buxferAccessToken>
) {
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
		const result = await fetch(request);
		const resp = buxferApiResponse.parse(await result.json());

		if ('error' in resp) {
			const { error: buxferErr } = resp;

			// @ts-expect-error error for dynamic number supplied but is intended use.
			error(result.status, {
            				code: ulid(),
            				message: buxferErr.message,
            			});
		}

		const { response } = resp;

		switch(true) {
			case 'tokens' in response:
				return tokenResponse.parse(response);
			
			case 'accounts' in response:
				return accountsResponse.parse(response);
			
			case 'transactions' in response:
				return transactionsResponse.parse(response);
			
			default:
				assertCannotReach(response);
		}

		return <never>null;
	} catch (e) {
		const err = e as HttpError;
		// TODO - replace with logging collection data service (ex. Sentry).
		logger.error('fetchError: ', err);

		if (err.status === 400 && err.body.message === 'Access denied. Please login first.')
			error(401, 'Unauthorized');

		// @ts-expect-error error for dynamic number supplied but is intended use.
		error(err.status || 500, err.body);
	}
};

type BuxferRequest =
	| { url: typeof api.login; body: z.infer<typeof buxferLogin> }
	| { url: typeof api.refresh; body: z.infer<typeof buxferRefresh> }
	| { url: typeof api.accounts; body?: (null | undefined) }
	| { url: typeof api.transactions; body: z.infer<typeof buxferTransactionsQuery> };

type BuxferResponse<T extends BuxferRequest> = Promise<
	T['url'] extends typeof api.login | typeof api.refresh
		? z.infer<typeof buxferTokens>
		: T['url'] extends typeof api.accounts
		? z.infer<typeof buxferAccounts>
		: T['url'] extends typeof api.transactions
		? z.infer<typeof buxferTransactions>
		: never
>

export async function BuxferClient<T extends Extract<BuxferRequest, { url: typeof api.login }>>(
	url: T['url'],
	body: T['body'],
	options?: { headers: Headers } | null | undefined
): BuxferResponse<T>;
export async function BuxferClient<T extends Extract<BuxferRequest, { url: typeof api.refresh }>>(
	url: T['url'],
	body: T['body'],
	options?: { headers: Headers } | null | undefined
): BuxferResponse<T>;
export async function BuxferClient<T extends Extract<BuxferRequest, { url: typeof api.accounts }>>(
	url: T['url'],
	body: T['body'],
	options?: { headers: Headers } | null | undefined
): BuxferResponse<T>;
export async function BuxferClient<T extends Extract<BuxferRequest, { url: typeof api.transactions }>>(
	url: T['url'],
	body: T['body'],
	options?: { headers: Headers } | null | undefined
): BuxferResponse<T>;
export async function BuxferClient<T extends BuxferRequest>(
	url: T['url'],
	body: T['body'],
	options?: { headers: Headers } | null | undefined
) {
	switch (url) {
		case api.login: {
			const { tokens } = await buxferProxy(url, buxferLogin.parse(body));
			return buxferTokens.parse(tokens);
		}

		case api.refresh: {
			const { tokens: refreshedTokens } = await buxferProxy(url, buxferRefresh.parse(body));
			return buxferTokens.parse(refreshedTokens);
		}

		case api.accounts: {
			const access = options?.headers?.get('Authorization')?.replace('Bearer: ', '') ?? '';
			if (!access) {
				error(401, 'Unathorized');
			}
			const { accounts } = await buxferProxy(url, { token: buxferToken.parse(access) });
			return buxferAccounts.parse(accounts);
		}

		case api.transactions: {
			const access = options?.headers?.get('Authorization')?.replace('Bearer: ', '') ?? '';
			if (!access) {
				error(401, 'Unathorized');
			}
			const { numTransactions: totalTransactionsCount, transactions } = await buxferProxy(url, {
				...buxferTransactionsQuery.parse({
					...body,
				}),
				token: buxferToken.parse(access),
			});

			return buxferTransactions.parse({ transactions, totalTransactionsCount });
		}
		default:
			assertCannotReach(url);
	}
	return <never>null;
}

function assertCannotReach(x: never) {
	throw new Error('cannot reach this place in the code', {cause: x});
}
