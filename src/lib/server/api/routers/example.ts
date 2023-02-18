import { procedure, router } from '../trpc';

export const exampleRouter = router({
	hello: procedure.query(() => `Hello tRPC v10 @ ${new Date().toLocaleTimeString()}`),
});

export type ExampleRouter = typeof exampleRouter;
