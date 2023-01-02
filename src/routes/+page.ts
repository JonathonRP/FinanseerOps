import type { PageLoad } from './$types';

// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true;

export const load = (({ params, fetch }) => {
    return {
        transactions: fetch('/api/transactions', { method: 'POST', body: JSON.stringify({ startDate: '2022-01-01', endDate: '2022-12-31' }) }).then(async (resp: Response) => (await resp.json()).transactions)
    }
}) satisfies PageLoad