import { literal, object, union, unknown } from 'zod';
import { logger } from '$lib/server/logger';
import { procedure, router } from '../trpc';

export const loggerRouter = router({
	log: procedure
		.input(
			object({
				level: union([literal('debug'), literal('error'), literal('warn'), literal('info'), literal('http')]),
				message: object({}),
			})
		)
		.mutation(async ({ input }) => {
			logger.log(input.level, input.message);
		}),
	error: procedure.input(unknown()).query(async ({ input }) => {
		logger.error(input);
	}),
});

export type LoggerRouter = typeof loggerRouter;
