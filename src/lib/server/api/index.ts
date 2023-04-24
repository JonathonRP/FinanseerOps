import type { inferProcedureOutput, inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { buxferRouter } from './routers/buxfer';
import { exampleRouter } from './routers/example';
import { userRouter } from './routers/user';
import { router } from './trpc';
import { loggerRouter } from './routers/logger';

export const appRouter = router({
	example: exampleRouter,
	buxfer: buxferRouter,
	user: userRouter,
	logger: loggerRouter,
});

export type AppRouter = typeof appRouter;

// 👇 type helpers 💡
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type Accounts = inferProcedureOutput<AppRouter['buxfer']['accounts']>;
export type Transactions = inferProcedureOutput<AppRouter['buxfer']['transactions']>['transactions'];
