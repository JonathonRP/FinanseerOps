import { renderTrpcPanel } from 'trpc-panel';
import { appRouter } from '$lib/server/api';
import type { RequestHandler } from './$types';

export const GET = (async ({ url: origin }) =>
	new Response(
		renderTrpcPanel(appRouter, {
			url: `${origin}/api/trpc`,
			transformer: 'superjson',
		})
	)) satisfies RequestHandler;
