import * as Sentry from '@sentry/sveltekit';
import { createFlatProxy } from '@trpc/server/shared';
import type {  HTTPBaseHandlerOptions } from '@trpc/server/http';
import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import type { AnyRouter, inferRouterContext } from '@trpc/server';
import { fetchRequestHandler, type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { appRouter } from './root';
import { createContext } from './context';
import { dev } from '$app/environment';

type SvelteCreateContextFn<TRouter extends AnyRouter> = (
	event: RequestEvent,
) => inferRouterContext<TRouter> | Promise<inferRouterContext<TRouter>>;

type SvelteCreateContextOption<TRouter extends AnyRouter> =
	unknown extends inferRouterContext<TRouter>
		? {
				/**
				 * @link https://trpc.io/docs/context
				 * */
				createContext?: SvelteCreateContextFn<TRouter>;
		  }
		: {
				/**
				 * @link https://trpc.io/docs/context
				 * */
				createContext: SvelteCreateContextFn<TRouter>;
		  };

type CreateApiServerOptions<TRouter extends AnyRouter> =
	HTTPBaseHandlerOptions<TRouter, Request> &
		SvelteCreateContextOption<TRouter> & {
			endpoint: string;
		}

type TRPCSvelteServerBase<_TRouter extends AnyRouter> = {
	handler: RequestHandler;
};

type TRPCSvelteServer<TRouter extends AnyRouter> = TRPCSvelteServerBase<TRouter>

async function svelteRequestHandler<TRouter extends AnyRouter>(
	opts: CreateApiServerOptions<TRouter>,
	event: RequestEvent,
) {
	return fetchRequestHandler({
		req: event.request,
		router: opts.router,
		endpoint: opts.endpoint,
		createContext: async (ops: FetchCreateContextFnOptions) => opts.createContext?.(event),
		batching: opts.batching,
		onError: opts.onError,
		responseMeta: opts.responseMeta
	})
}

function createApiServer<TRouter extends AnyRouter>(options: CreateApiServerOptions<TRouter>) {
	const errorMessage = 'use trpc server calls, "createCallerFactory"';
	return createFlatProxy<TRPCSvelteServer<TRouter>>((firstPath) => {
    switch (firstPath) {
      	case "handler":
        	return (event: RequestEvent) => svelteRequestHandler(options, event);
    }
	throw new TypeError(errorMessage);
  });
}

export const apiServer = createApiServer({
	endpoint: '/api/trpc',
	router: appRouter,
	createContext,
	...(!dev && {
		onError: ({ type, path, req, error }) => {
			// TODO - replace with logging collection data service (ex. Sentry).
			// logger.error(
			// 	`Encountered error while trying to process ${JSON.stringify(req)}, ${type} @ ${path ?? '[no path]'}:`,
			// 	error.stack
			// );
			Sentry.captureException(new Error(`Encountered error while trying to process ${JSON.stringify(req, null, 2)}, ${type} @ ${path ?? '[no path]'}` ))
			throw error;
		},
	}),
});