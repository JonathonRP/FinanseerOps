import { renderTrpcPanel } from 'trpc-panel';
import { appRouter } from '$lib/server/api';
import type { RequestHandler } from './$types';

const handle = (({url}) => {
    const panelHtml = renderTrpcPanel(appRouter, {
        url: `${url.origin}/api/trpc`,
        transformer: 'superjson',
    });
    const panel = new File([panelHtml], 'api.html', {type: 'text/html'});
    return new Response(panel, { headers: {ContentType: 'text/html'} });
}) satisfies RequestHandler;

export const GET = handle;