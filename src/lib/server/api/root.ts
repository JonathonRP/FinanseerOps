import { buxferAccountRouter } from './routers/buxferAccount';
import { exampleRouter } from './routers/example';
import { userRouter } from './routers/user';
import { router } from './trpc';

export const appRouter = router({
	example: exampleRouter,
	buxferAccount: buxferAccountRouter,
	user: userRouter,
});

export type AppRouter = typeof appRouter;
