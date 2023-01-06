import type { HandleFetch } from './$types';
import { error } from '@sveltejs/kit';

type BuxferError = {
    type: string,
    message: string
}

type BuxferToken = { 
    token: string 
}

type BuxferData = { 
    status: 'OK'
} & ( BuxferToken | BuxferTransactions | BuxferAccounts );

type BuxferResponse = {
    response : BuxferData,
    error? : BuxferError
}

export type BuxferTransactions = { 
    numTransactions: number, 
    transactions: [{
        id: number,
        description: string,
        date: Date,
        type: string,
        amount: number,
        accountId: string,
        tags: string 
    }]
}

export type BuxferAccounts = { 
    acounts: { 
        id: number, 
        name: string, 
        bank: string, 
        balance: number 
    }
} 

export default (email: string, password: string) => {
    return (async ({ event, fetch, request }) => {

        // const origin = event.request.headers.get('Origin');
        // console.log(event.request.headers)
        // if (!origin || new URL(origin).origin !== event.url.origin) {
        //     console.log('bad request!')
        //     throw error(403, "Bad Request");
        // }

        if (!event.cookies.get('session')) {
            const authUrl = new URL('/api/login', event.url.origin);

            await forward(authUrl, { method: 'POST', body: JSON.stringify({ email, password }) })
                .then(async resp => (await resp.json() as BuxferToken).token)
                .then(session =>
                    event.cookies.set('session', session, {
                        path: '/',
                        httpOnly: true,
                        sameSite: 'strict',
                        secure: false, // process.env.NODE_ENV === 'production',
                        maxAge: 60*60,
                        expires: new Date(new Date().setTime(new Date().getTime() + (60*60*1000)))
                    }
                )
            );

            console.log('session: ', event.cookies.get('session'))
        }

        request = new Request(request.url, {method: 'POST', body: JSON.stringify(Object.assign({}, { token: event.cookies.get('session') }, await request.json())) });

        return new URL(request.url).pathname.includes('/api') && await forward(request.url, request) || await fetch(request)
    }) satisfies HandleFetch;
}

const forward = async (url: URL | string, request: RequestInit) => {
    try {
        const buxferRequest = { method: 'POST', body: new URLSearchParams( await new Response(request.body).json() ) };
        const resp = await fetch(url, buxferRequest)

        if(!resp.ok)
            throw error(resp.status, (await resp.json() as BuxferResponse).error?.message)

        return new Response(JSON.stringify((await resp.json() as BuxferResponse).response));

    } catch (err: any) {
        console.error('fetchError: ',err);
        throw error(err?.status || 500, err?.body?.message || err)
    }
}