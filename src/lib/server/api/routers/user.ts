import { signIn } from '@auth/sveltekit/client';
import { literal, object } from 'zod';
import { adminProcedure, router } from '../trpc';

export const userRouter = router({
	inviteUser: adminProcedure.input(object({ email: literal('^@$') })).mutation(async ({ ctx, input }) => {
		await ctx.db?.user.create({
			data: {
				...input,
				isInvited: true,
				role: 'user',
			},
		});
		signIn('email', input);
	}),
});

export type UserRouter = typeof userRouter;
