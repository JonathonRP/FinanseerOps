import { error } from '@sveltejs/kit';
import { format, formatISO, parse, parseISO } from 'date-fns';
import path from 'path';
import { array, number, object, string, union, z, coerce, date, lazy } from 'zod';
import { fromFetch } from 'rxjs/fetch';
import {
	type Observable,
	map,
	catchError,
	expand,
	EMPTY,
	reduce,
	throwError,
	repeat,
	takeWhile,
	delay,
	switchMap,
	timer,
} from 'rxjs';
import * as Sentry from '@sentry/sveltekit';
import { dateFormat } from '$/lib/utils';
import { Intl } from '@js-temporal/polyfill';

const DateFormat = 'yyyy-MM-dd';

export const accounts = array(
	object({
		id: number(),
		name: string(),
		bank: string(),
		balance: number(),
	})
);

const transactionsPage = object({
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
				.transform((arg) => new Date(arg)),
			type: string(),
			amount: number(),
			accountId: number(),
			tags: string(),
		})
	),
	totalRecords: number().default(0),
	totalPages: number().default(0),
	next: number().optional(),
	current: number(),
	previous: number().optional(),
}).transform(({ totalTransactionsCount, current, totalRecords, totalPages, transactions }) => ({
	transactions,
	totalRecords: transactions.length,
	totalPages: Math.ceil(totalTransactionsCount / totalRecords),
	previous: current > 1 ? current - 1 : undefined,
	current,
	next: current <= totalPages ? current + 1 : undefined,
}));

export const transactions = array(
	object({
		id: number(),
		description: string(),
		date: date(),
		type: string(),
		amount: number(),
		accountId: number(),
		tags: string(),
	})
);

export const token = string();

// const tokensResponse = object({
// 	tokens: object({
// 		access: token,
// 		refresh: token,
// 	})
// });

const tokenResponse = object({
	token,
});

const accountsResponse = object({
	accounts,
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

const accessToken = tokenResponse;

// const buxferRefresh = object({
// 	refresh: token
// });

const buxferResponse = union([tokenResponse, accountsResponse, transactionsResponse]);
const buxferError = object({
	type: string(),
	message: string(),
});

const buxferApiResponse = union([object({ response: buxferResponse }), object({ error: buxferError })]);

export const login = object({
	email: string(),
	password: string(),
});

export const transactionsQueryParams = object({
	startDate: date(),
	endDate: date(),
	cursor: number().nullish().default(1).pipe(coerce.string()),
}).transform(({ startDate, endDate, cursor }) => ({ startDate, endDate, page: cursor }));

const transactionsQueryParamsInternal = transactionsQueryParams.transform(({ startDate, endDate, page }) => ({
	startDate: format(startDate, DateFormat),
	endDate: format(endDate, DateFormat),
	page,
}));

// export const tokens = object({
// 	access: token,
// 	refresh: token
// });

const prefix = 'api';

const api = {
	login: '/login',
	// refresh: '/refresh',
	accounts: '/accounts',
	transactions: '/transactions',
} as const;

const routes = new Map<string, string>([
	[api.login, path.join(prefix, api.login)],
	// [api.refresh, path.join(prefix, api.refresh)],
	[api.accounts, path.join(prefix, api.accounts)],
	[api.transactions, path.join(prefix, api.transactions)],
]);

const headers = new Headers([['Content-Type', 'application/x-www-form-urlencoded']]);

const BuxferDomain = 'https://www.buxfer.com';

type BuxferProxyRequest =
	| { url: typeof api.login; body: z.infer<typeof login> }
	// | { url: typeof api.refresh; body: z.infer<typeof buxferRefresh> }
	| { url: typeof api.accounts; body: z.infer<typeof accessToken> }
	| {
			url: typeof api.transactions;
			body: z.infer<typeof transactionsQueryParamsInternal> & z.infer<typeof accessToken>;
	  };

type BuxferProxyResponse<T extends BuxferProxyRequest> = Observable<
	T['url'] extends typeof api.login /* | typeof api.refresh */
		? z.infer<typeof tokenResponse>
		: T['url'] extends typeof api.accounts
			? z.infer<typeof accountsResponse>
			: T['url'] extends typeof api.transactions
				? z.infer<typeof transactionsResponse>
				: never
>;

function buxferProxy<T extends Extract<BuxferProxyRequest, { url: typeof api.login }>>(
	endpoint: T['url'],
	body: T['body']
): BuxferProxyResponse<T>;
// async function buxferProxy<T extends Extract<BuxferProxyRequest, { url: typeof api.refresh }>>(
// 	endpoint: T['url'],
// 	body: T['body'],
// ): BuxferProxyResponse<T>;
function buxferProxy<T extends Extract<BuxferProxyRequest, { url: typeof api.accounts }>>(
	endpoint: T['url'],
	body: T['body']
): BuxferProxyResponse<T>;
function buxferProxy<T extends Extract<BuxferProxyRequest, { url: typeof api.transactions }>>(
	endpoint: T['url'],
	body: T['body']
): BuxferProxyResponse<T>;
function buxferProxy(
	endpoint: (typeof api)[keyof typeof api],
	body:
		| z.infer<typeof login>
		| (z.infer<typeof transactionsQueryParamsInternal> & z.infer<typeof accessToken>)
		| z.infer<typeof accessToken>
) {
	const bodyConstruct = new URLSearchParams({ ...body });
	const rerouteURL = new URL(
		`${routes.get(endpoint) ?? <never>null}?${decodeURIComponent(bodyConstruct.toString())}`,
		BuxferDomain
	);
	const buxferRequest = new Request(rerouteURL, {
		method: 'POST',
		headers,
		body: { ...bodyConstruct },
	});

	return fromFetch(buxferRequest.clone(), {
		selector: (resp) => resp.json(),
	}).pipe(
		map((data) => {
			const result = buxferApiResponse.parse(data);
			if ('error' in result) {
				const { error: buxferErr } = result;

				Sentry.captureMessage(buxferErr.message);
				throw new Error(buxferErr.message, {
					cause: buxferErr,
				});
			}

			const { response } = result;

			switch (true) {
				// case 'tokens' in response:
				// 	return tokenResponse.parse(response);

				case 'token' in response:
					return tokenResponse.parse(response);

				case 'accounts' in response:
					return accountsResponse.parse(response);

				case 'transactions' in response:
					return transactionsResponse.parse(response);

				default:
					assertCannotReach(response);
			}

			return <never>null;
		}),
		catchError((err) => {
			// TODO - replace with logging collection data service (ex. Sentry).
			// logger.error('fetchError: ', err);

			// if (err.status === 400 && err.body.message === 'Access denied. Please login first.')
			// 	return error(401, 'Unauthorized');

			// return error(err.status || 500, err.body);
			Sentry.captureException(err);
			return throwError(() => ({
				message: err.message,
				...(err?.code && { code: err.code }),
				...(err?.cause && { cause: err.cause }),
				...(err?.stack && { stack: err.stack }),
			}));
		})
	);
}

type BuxferRequest =
	| { url: typeof api.login; body: z.infer<typeof login> }
	// | { url: typeof api.refresh; body: z.infer<typeof buxferRefresh> }
	| { url: typeof api.accounts; body?: null | undefined }
	| { url: typeof api.transactions; body: z.infer<typeof transactionsQueryParams> };

type BuxferResponse<T extends BuxferRequest> = Observable<
	T['url'] extends typeof api.login /* | typeof api.refresh */
		? z.infer<typeof token>
		: T['url'] extends typeof api.accounts
			? z.infer<typeof accounts>
			: T['url'] extends typeof api.transactions
				? z.infer<typeof transactions>
				: never
>;

export function client<T extends Extract<BuxferRequest, { url: typeof api.login }>>(
	url: T['url'],
	body: T['body'],
	options?: { headers: Headers } | null | undefined
): BuxferResponse<T>;
// export async function client<T extends Extract<BuxferRequest, { url: typeof api.refresh }>>(
// 	url: T['url'],
// 	body: T['body'],
// 	options?: { headers: Headers } | null | undefined
// ): BuxferResponse<T>;
export function client<T extends Extract<BuxferRequest, { url: typeof api.accounts }>>(
	url: T['url'],
	body: T['body'],
	options?: { headers: Headers } | null | undefined
): BuxferResponse<T>;
export function client<T extends Extract<BuxferRequest, { url: typeof api.transactions }>>(
	url: T['url'],
	body: T['body'],
	options?: { headers: Headers } | null | undefined
): BuxferResponse<T>;
export function client<T extends BuxferRequest>(
	url: T['url'],
	body: T['body'],
	options?: { headers: Headers } | null | undefined
) {
	const pollingRate = 1000;
	switch (url) {
		// case api.login: {
		// 	const { tokens: tokensData } = await buxferProxy(url, login.parse(body));
		// 	return tokens.parse(tokensData);
		// }

		// case api.refresh: {
		// 	const { tokens: refreshedTokens } = await buxferProxy(url, buxferRefresh.parse(body));
		// 	return tokens.parse(refreshedTokens);
		// }

		case api.login: {
			return buxferProxy(url, login.parse(body)).pipe(
				catchError((err) => throwError(() => err)),
				map(({ token: tokenData }) => token.parse(tokenData))
			);
		}

		case api.accounts: {
			const access = options?.headers?.get('Authorization')?.replace('Bearer: ', '') ?? '';
			if (!access) {
				error(401, 'Unathorized');
			}
			return buxferProxy(url, { token: token.parse(access) }).pipe(
				catchError((err) => throwError(() => err)),
				map(({ accounts: accountsData }) => accounts.parse(accountsData))
				// delay(pollingRate),
				// repeat()
			);
		}

		case api.transactions: {
			const access = options?.headers?.get('Authorization')?.replace('Bearer: ', '') ?? '';
			if (!access) {
				error(401, 'Unathorized');
			}
			const parsedBody = transactionsQueryParamsInternal.parse({ ...body });
			return buxferProxy(url, {
				...parsedBody,
				token: token.parse(access),
			}).pipe(
				catchError((err) => throwError(() => err)),
				map(({ numTransactions: totalTransactionsCount, transactions }) =>
					transactionsPage.parse({
						transactions,
						totalTransactionsCount,
						current: Number(parsedBody.page),
					})
				),
				expand(({ next }) =>
					next
						? buxferProxy(url, {
								...transactionsQueryParamsInternal.parse({ ...body, cursor: next }),
								token: token.parse(access),
							}).pipe(
								catchError((err) => throwError(() => err)),
								map(({ numTransactions: totalTransactionsCount, transactions }) =>
									transactionsPage.parse({
										transactions,
										totalTransactionsCount,
										current: next,
									})
								)
							)
						: EMPTY
				),
				map((page) => page.transactions),
				reduce((acc, curr) => acc.concat(curr))
				// delay(pollingRate),
				// repeat()
			);
		}
		default:
			assertCannotReach(url);
	}
	return <never>null;
}

function assertCannotReach(x: never) {
	throw new Error('cannot reach this place in the code', { cause: x });
}
