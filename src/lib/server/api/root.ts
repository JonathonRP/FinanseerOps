import { buxferRouter } from './routers/buxfer';
import { exampleRouter } from './routers/example';
import { userRouter } from './routers/user';
import { router } from './trpc';

export const appRouter = router({
	example: exampleRouter,
	buxfer: buxferRouter,
	user: userRouter,
});

export type AppRouter = typeof appRouter;
