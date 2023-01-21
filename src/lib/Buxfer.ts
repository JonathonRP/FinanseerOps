// import type { Handle } from './$types';
import { type RequestEvent, type Handle, error } from '@sveltejs/kit';
import cookie from 'cookie';
import { api } from './utils';
import { dev } from '$app/environment'
import { array, date, discriminatedUnion, z, number, object, string, union } from 'zod';

type BuxferInitOptions = z.infer<typeof buxferLogin>;

type BuxferData = z.infer<typeof buxferData>;

type BuxferError = {
    type: string,
    message: string
}

type BuxferResponse = {
    response : BuxferData,
    error? : BuxferError
}

const BuxferDomain = 'https://www.buxfer.com';

const buxferSessionKey = 'buxfer_session';

export const buxferToken = object({
    token: string()
});

export const buxferTransactions = object({
    numTransactions: string(), 
    transactions: array(object({
        id: number(),
        description: string(),
        date: string(),
        type: string(),
        amount: number(),
        accountId: number(),
        tags: string()
    }))
});

export const buxferAccounts = object({
    accounts: array(object({ 
        id: number(), 
        name: string(), 
        bank: string(), 
        balance: number() 
    }))
});

export const buxferData = union([
    buxferToken,
    buxferTransactions,
    buxferAccounts 
]);

export const buxferLogin = object({
    email: string(),
    password: string()
});

// export default (options: BuxferInitOptions) => {

//     return (async ({ event, resolve }) => {
//         const { fetch, url, request, cookies } = event;
//         event.locals.getToken ??= () => getToken({fetch, url, request, cookies}, options);
        
//         console.log(url, request, cookies)
//         return await resolve(event);
//     }) satisfies Handle;
// }

export async function getToken(event: Pick<RequestEvent, 'fetch' | 'url' | 'request'>, options: BuxferInitOptions): Promise<string> {
    console.log('getToken')
    return cookie.parse(event.request.headers.get('cookie') || '')[buxferSessionKey] || (await client<z.infer<typeof buxferToken>>('/api/login', {body: options})).token;
}

export async function client<T extends BuxferData>(endpoint: string, init?: undefined | Omit<RequestInit, 'body'> & { body: any}): Promise<T> {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded'};
    const buxferConfig = {
        method: 'POST',
        ...init,
        headers : {
            ...headers,
            ...init?.headers
        },
        body: new URLSearchParams(init?.body)
    } satisfies RequestInit;

    const rerouteURL = new URL(endpoint, BuxferDomain);
    const request = new Request(rerouteURL, buxferConfig)

    try {
        const resp = await fetch(request);

        if(!resp.ok)
            throw error(resp.status, (await resp.json() as BuxferResponse).error?.message)

        return <T>((<BuxferResponse> await resp.json()).response);

    } catch (err: any) {
        console.error('fetchError: ',err);
        throw error(err?.status || 500, err?.body?.message || err)
    }
}