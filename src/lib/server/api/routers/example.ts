import { procedure, router } from '../trpc';

export const exampleRouter = router({
	hello: procedure.query(() => {
		return `Hello tRPC v10 @ ${new Date().toLocaleTimeString()}`;
	})
});

export type ExampleRouter = typeof exampleRouter;