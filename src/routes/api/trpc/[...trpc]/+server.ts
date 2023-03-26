import { appRouter } from '$lib/server/api';
import { createContext } from '$lib/server/api/trpc';
import { logger } from '$lib/server/logger';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { RequestHandler } from './$types';

// const handler = (async (event) =>
// 	fetchRequestHandler({
// 		endpoint: '/api/trpc',
// 		req: event.request,
// 		router: appRouter,
// 		createContext: await createContext(event),
// 		onError: ({ type, path, error }) => {
// 			// TODO - replace with logging collection data service (ex. Sentry).
// 			logger.error(`Encountered error while trying to process ${type} @ ${path}:`, error);
// 		},
// 	})) satisfies RequestHandler;

// function createTRPCHandle<Router extends AnyRouter, URL extends string>({
// 	router,
// 	url = '/trpc',
// 	createContext,
// 	responseMeta,
// 	onError,
// }: {
// 	/**
// 	 * The tRPC router to use.
// 	 * @see https://trpc.io/docs/router
// 	 */
// 	router: Router;

// 	/**
// 	 * The tRPC api endpoint URL.
// 	 * @default '/trpc'
// 	 */
// 	url?: ValidRoute<URL>;

// 	/**
// 	 * An async function that returns the tRPC context.
// 	 * @see https://trpc.io/docs/context
// 	 */
// 	createContext?: (event: RequestEvent) => Promise<inferRouterContext<Router>>;

// 	/**
// 	 * A function that returns the response meta.
// 	 * @see https://trpc.io/docs/caching#using-responsemeta-to-cache-responses
// 	 */
// 	responseMeta?: (opts: {
// 		data: TRPCResponse<unknown, inferRouterError<Router>>[];
// 		ctx?: inferRouterContext<Router>;
// 		paths?: string[];
// 		type: ProcedureType;
// 		errors: TRPCError[];
// 	}) => ResponseMeta;

// 	/**
// 	 * A function that is called when an error occurs.
// 	 * @see https://trpc.io/docs/error-handling#handling-errors
// 	 */
// 	onError?: (opts: {
// 		ctx?: inferRouterContext<Router>;
// 		error: TRPCError;
// 		path: string;
// 		input: unknown;
// 		req: RequestInit;
// 		type: ProcedureType | 'unknown';
// 	}) => void;
// }): Handle {
// 	return async ({ event, resolve }) => {
// 		if (event.url.pathname.startsWith(url)) {
// 			const request = event.request as Request & {
// 				headers: Dict<string | string[]>;
// 			};

// 			const req = {
// 				method: request.method,
// 				headers: request.headers,
// 				query: event.url.searchParams,
// 				body: await request.text(),
// 			};

// 			const httpResponse = await resolveHTTPResponse({
// 				router,
// 				req,
// 				path: event.url.pathname.substring(url.length + 1),
// 				createContext: async () => createContext?.(event),
// 				responseMeta,
// 				onError,
// 			});

// 			const { status, headers, body } = httpResponse as {
// 				status: number;
// 				headers: Record<string, string>;
// 				body: string;
// 			};

// 			return new Response(body, { status, headers });
// 		}

// 		return resolve(event);
// 	};
// }

// type CreateNextContextOptions = NodeHTTPCreateContextFnOptions<
//   NextApiRequest,
//   NextApiResponse
// >;

// function createNextApiHandler<TRouter extends AnyRouter>(
//   opts: NodeHTTPHandlerOptions<TRouter, NextApiRequest, NextApiResponse>,
// ): NextApiHandler {
//   return async (req, res) => {
//     function getPath(): string | null {
//       if (typeof req.query.trpc === 'string') {
//         return req.query.trpc;
//       }
//       if (Array.isArray(req.query.trpc)) {
//         return req.query.trpc.join('/');
//       }
//       return null;
//     }
//     const path = getPath();

//     if (path === null) {
//       const error = opts.router.getErrorShape({
//         error: new TRPCError({
//           message:
//             'Query "trpc" not found - is the file named `[trpc]`.ts or `[...trpc].ts`?',
//           code: 'INTERNAL_SERVER_ERROR',
//         }),
//         type: 'unknown',
//         ctx: undefined,
//         path: undefined,
//         input: undefined,
//       });
//       res.statusCode = 500;
//       res.json({
//         id: -1,
//         error,
//       });
//       return;
//     }

//     await nodeHTTPRequestHandler({
//       ...opts,
//       req,
//       res,
//       path,
//     });
//   };
// }

export const GET = handler;
export const POST = handler;
