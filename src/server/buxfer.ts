import { error } from '@sveltejs/kit';
import path from 'path';
import { array, number, object, string, union, z, coerce, boolean, custom } from 'zod';
import { fromFetch } from 'rxjs/fetch';
import {
	type Observable,
	map,
	catchError,
	EMPTY,
	throwError,
	tap,
	share,
	switchMap,
	timer,
	type MonoTypeOperatorFunction,
	takeWhile,
	last,
	reduce,
	of,
	mergeMap,
	concat,
} from 'rxjs';
import * as Sentry from '@sentry/sveltekit';

export const temporal = {
	instant: () => custom<Temporal.Instant>((v) => Temporal.Instant.from(v)),

	zonedDateTime: () => custom<Temporal.ZonedDateTime>((v) => Temporal.ZonedDateTime.from(v)),

	plainDate: () => custom<Temporal.PlainDate>((v) => Temporal.PlainDate.from(v)),
};

const DateFormat = 'yyyy-MM-dd';

export const accounts = array(
	object({
		id: number(),
		name: string(),
		bank: string(),
		balance: number(),
	})
);

const buxferPageSize = 100;
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
			isPending: boolean(),
			date: union([temporal.plainDate(), coerce.string().date()])
				.transform((date) => Temporal.PlainDate.from(date))
				.pipe(coerce.string().date().pipe(temporal.plainDate())),
			type: string(),
			amount: number(),
			accountId: number(),
			tags: string(),
		})
	),
	totalRecords: number().default(0),
	totalPages: number().default(0),
	next: number().optional(),
	current: union([number(), string()]).pipe(coerce.number()),
	previous: number().optional(),
}).transform(({ totalTransactionsCount, current, transactions }) => ({
	transactions,
	totalRecords: transactions.length,
	totalPages: Math.ceil(totalTransactionsCount / buxferPageSize),
	previous: current > 1 ? current - 1 : undefined,
	current,
	next: current < Math.ceil(totalTransactionsCount / buxferPageSize) ? current + 1 : undefined,
}));

export const transactions = array(
	object({
		id: number(),
		description: string(),
		isPending: boolean(),
		date: temporal.plainDate(),
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
			isPending: boolean(),
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
	startDate: custom<Temporal.PlainDate>((val) => Temporal.PlainDate.from(val)).pipe(coerce.string()),
	endDate: custom<Temporal.PlainDate>((val) => Temporal.PlainDate.from(val)).pipe(coerce.string()),
	page: union([number(), string()]).nullish().default(1).pipe(coerce.string()),
});

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
			body: z.infer<typeof transactionsQueryParams> & z.infer<typeof accessToken>;
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
		| (z.infer<typeof transactionsQueryParams> & z.infer<typeof accessToken>)
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

	return fromFetch(buxferRequest, {
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
		}),
		tap(() => console.log('fetch: ', endpoint, Temporal.Now.zonedDateTimeISO().toLocaleString())),
		share()
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

type ClientOptions = { headers: Headers; poll?: boolean; interval?: `${number}s` };

export function client<T extends Extract<BuxferRequest, { url: typeof api.login }>>(
	url: T['url'],
	body: T['body'],
	options?: ClientOptions | null | undefined
): BuxferResponse<T>;
// export async function client<T extends Extract<BuxferRequest, { url: typeof api.refresh }>>(
// 	url: T['url'],
// 	body: T['body'],
// 	options?: { headers: Headers } | null | undefined
// ): BuxferResponse<T>;
export function client<T extends Extract<BuxferRequest, { url: typeof api.accounts }>>(
	url: T['url'],
	body: T['body'],
	options?: ClientOptions | null | undefined
): BuxferResponse<T>;
export function client<T extends Extract<BuxferRequest, { url: typeof api.transactions }>>(
	url: T['url'],
	body: T['body'],
	options?: ClientOptions | null | undefined
): BuxferResponse<T>;
export function client<T extends BuxferRequest>(
	url: T['url'],
	body: T['body'],
	options?: ClientOptions | null | undefined
) {
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
				map(({ accounts: accountsData }) => accounts.parse(accountsData)),
				tap(() => console.log('client: ', url, Temporal.Now.zonedDateTimeISO().toLocaleString()))
				// delay(pollingRate),
				// repeat()
			);
		}

		case api.transactions: {
			const data = transactionsQueryParams.parse(body);
			let access;
			let enablePolling = false;
			let interval = 1000;

			if (options) {
				const { headers, poll: polling, interval: optionsInterval } = options;
				access = headers?.get('Authorization')?.replace('Bearer: ', '') ?? '';
				enablePolling = polling ?? false;
				interval = Number(optionsInterval?.replace('s', '')) * 1000;
			}
			if (!access) {
				error(401, 'Unathorized');
			}

			return buxferProxy(url, {
				...transactionsQueryParams.parse(data),
				token: token.parse(access),
			}).pipe(
				catchError((err) => throwError(() => err)),
				map(({ numTransactions: totalTransactionsCount, transactions }) =>
					transactionsPage.parse({
						transactions,
						totalTransactionsCount,
						current: data.page,
					})
				),
				mergeMap(({ transactions, next }) => {
					const transactions$ = of(transactions);
					const next$ = next
						? client('/transactions', transactionsQueryParams.parse({ ...body, page: next }), {
								headers: options?.headers ?? new Headers(),
							})
						: EMPTY;
					return concat(transactions$, next$);
				}),
				reduce((acc, curr) => acc.concat(curr)),
				tap(() => console.log('client: ', url, Temporal.Now.zonedDateTimeISO().toLocaleString()))
				// connect((shared$) =>
				// 	concat(shared$,
				// 	defer(() => shared$).pipe(
				// 		tap(() => console.log('polling: ', url, new Date(Date.now()).toLocaleTimeString())),
				// 		polling(interval, () => enablePolling, (() => !enablePolling)())
				// 	))
				// )
			);
		}
		default:
			assertCannotReach(url);
	}
	return <never>null;
}

function polling<T>(
	pollInterval: number,
	active: (res: T) => boolean,
	emitOnlyLast = false
): MonoTypeOperatorFunction<T> {
	return (source$) => {
		const polling$ = timer(0, pollInterval).pipe(
			switchMap(() => source$),
			takeWhile(active, true),
			tap(() => console.log('polling: ', Temporal.Now.zonedDateTimeISO().toLocaleString()))
		);
		return emitOnlyLast ? polling$.pipe(last()) : polling$;
	};
}

function assertCannotReach(x: never) {
	throw new Error('cannot reach this place in the code', { cause: x });
}
