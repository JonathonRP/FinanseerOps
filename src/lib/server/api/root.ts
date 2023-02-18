import { buxferAccountRouter } from './routers/buxfer_account';
import { exampleRouter } from './routers/example';
import { userRouter } from './routers/user';
import { router } from './trpc';

export const appRouter = router({
	example: exampleRouter,
	buxfer_account: buxferAccountRouter,
	user: userRouter,
});

export type AppRouter = typeof appRouter;
