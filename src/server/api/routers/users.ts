import { procedure, router } from '../trpc';

export const usersRouter = router({
	retrieve: procedure.query(async ({ ctx }) => ctx.db.query.users.findMany()),
});

export type UsersRouter = typeof usersRouter;
