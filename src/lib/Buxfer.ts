import { error } from '@sveltejs/kit';
import { array, number, object, string, union, z } from 'zod';

type BuxferData = z.infer<typeof buxferData>;

type BuxferError = {
	type: string;
	message: string;
};

type BuxferResponse = {
	response: BuxferData;
	error?: BuxferError;
};

const BuxferDomain = 'https://www.buxfer.com';

export const buxferToken = object({
	token: string(),
});

export const buxferTransactions = object({
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

export const buxferAccounts = object({
	accounts: array(
		object({
			id: number(),
			name: string(),
			bank: string(),
			balance: number(),
		})
	),
});

export const buxferData = union([buxferToken, buxferTransactions, buxferAccounts]);

export const buxferLogin = object({
	email: string(),
	password: string(),
});

export async function client<T extends BuxferData>({
	endpoint,
	init,
}: {
	endpoint: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	init?: undefined | (Omit<RequestInit, 'body'> & { body: any });
}): Promise<T> {
	const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
	const buxferConfig = {
		method: 'POST',
		...init,
		headers: {
			...headers,
			...init?.headers,
		},
		body: new URLSearchParams(init?.body),
	} satisfies RequestInit;

	const rerouteURL = new URL(endpoint, BuxferDomain);
	const request = new Request(rerouteURL, buxferConfig);

	try {
		const resp = await fetch(request);

		if (!resp.ok)
			// eslint-disable-next-line @typescript-eslint/no-throw-literal
			throw error(resp.status, {
				code: crypto.randomUUID(),
				message: ((await resp.json()) as BuxferResponse).error?.message || '',
			});

		return <T>(<BuxferResponse>await resp.json()).response;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		console.error('fetchError: ', err);
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw error(err?.status || 500, err?.body?.message || err);
	}
}
