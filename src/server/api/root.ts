import type { inferRouterOutputs } from '@trpc/server';
import { router } from './trpc';
import { buxferRouter } from './routers/buxfer';
import { userRouter } from './routers/user';
import { usersRouter } from './routers/users';
import { notificationsRouter } from './routers/notifications';

export const appRouter = router({
	buxfer: buxferRouter,
	user: userRouter,
	users: usersRouter,
	notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
export type Accounts = inferRouterOutputs<AppRouter>['buxfer']['accounts'];
export type Transactions = inferRouterOutputs<AppRouter>['buxfer']['transactions'];
export { createCallerFactory } from './trpc';
