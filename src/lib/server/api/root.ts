import { router } from './trpc';
import { exampleRouter } from './routers/example';
import { buxfer_accountRouter } from './routers/buxfer_account';

export const appRouter = router({
	example: exampleRouter,
	buxfer_account: buxfer_accountRouter
});

export type AppRouter = typeof appRouter;