import { procedure, router } from '../trpc';

export const usersRouter = router({
	retrieve: procedure.query(async ({ ctx }) => ctx.db.user.findMany()),
});

export type UsersRouter = typeof usersRouter;
