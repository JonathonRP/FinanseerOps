import { appRouter } from '$lib/server/api';
import { createContext } from '$lib/server/api/trpc';
import { logger } from '$lib/server/logger';
import type { AnyRouter, Dict, inferRouterContext, inferRouterError, ProcedureType, TRPCError } from '@trpc/server';
import type { RequestEvent, RequestHandler } from './$types';
import { resolveHTTPResponse, type ResponseMeta } from '@trpc/server/http';
import type { TRPCResponse } from '@trpc/server/rpc';

function createSvelteApiHandler <Router extends AnyRouter>({
  router,
  createContext,
  responseMeta,
  onError
}: {
  /**
   * The tRPC router to use.
   * @see https://trpc.io/docs/router
   */
  router: Router;

  /**
   * An async function that returns the tRPC context.
   * @see https://trpc.io/docs/context
   */
  createContext?: (event: RequestEvent) => Promise<inferRouterContext<Router>>;

  /**
   * A function that returns the response meta.
   * @see https://trpc.io/docs/caching#using-responsemeta-to-cache-responses
   */
  responseMeta?: (opts: {
    data: TRPCResponse<unknown, inferRouterError<Router>>[];
    ctx?: inferRouterContext<Router>;
    paths?: string[];
    type: ProcedureType | 'unknown';
    errors: TRPCError[];
  }) => ResponseMeta;

  /**
   * A function that is called when an error occurs.
   * @see https://trpc.io/docs/error-handling#handling-errors
   */
  onError?: (opts: {
    ctx?: inferRouterContext<Router>;
    error: TRPCError;
    path: string | undefined;
    input: unknown;
    req: Omit<RequestInit, 'body' | 'headers'> & { headers: Dict<string | string[]>; body: unknown };
    type: ProcedureType | 'unknown';
  }) => void;
}): RequestHandler {
  return async (event) => {
      const request = event.request as Request & {
        headers: Dict<string | string[]>;
      };

      const req = {
        method: request.method,
        headers: request.headers,
        query: event.url.searchParams,
        body: await request.text()
      };

      const url = event.route.id.split('/').slice(0,-1).join('/');

      const httpResponse = await resolveHTTPResponse({
        router,
        req,
        path: event.url.pathname.substring(url.length + 1),
        createContext: async () => createContext?.(event),
        responseMeta,
        onError
      });

      const { status, headers, body } = httpResponse as {
        status: number;
        headers: Record<string, string>;
        body: string;
      };

      return new Response(body, { status, headers });
  };
}

const handle = createSvelteApiHandler({
    router: appRouter,
    createContext,
    onError: ({ type, path, req, error }) => {
        // TODO - replace with logging collection data service (ex. Sentry).
        logger.error(`Encountered error while trying to process ${JSON.stringify(req)}, ${type} @ ${path}:`, error);
    },
});

export const GET = handle;
export const POST = handle;
