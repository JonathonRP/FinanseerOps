import { signIn } from '@auth/sveltekit/client';
import { object, string } from 'zod';
import { TRPCError } from '@trpc/server';
import { adminProcedure, procedure, router } from '../trpc';

export const userRouter = router({
	retrieve: procedure
		.input(object({ id: string() }).optional())
		.query(async ({ ctx, input }) => ctx.db.user.findUnique({ where: { id: ctx.session?.user?.id || input?.id } })),
	update: procedure
		.input(object({ id: string().optional(), name: string() }))
		.mutation(async ({ ctx, input: { id, name } }) =>
			ctx.db.user.update({
				where: {
					id: ctx.session?.user?.id || id,
				},
				data: { name },
			})
		),
	invite: adminProcedure.input(object({ email: string().email() })).mutation(async ({ ctx, input }) => {
		if (await ctx.db.user.findUnique({ where: input })) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'Email is already invited',
			});
		}

		await ctx.db.user.create({
			data: {
				...input,
				isInvited: true,
				role: 'user',
				accounts: {
					create: [
						{
							type: 'email',
							provider: 'invitation',
							providerAccountId: input.email?.normalize() ?? '',
						},
					],
				},
			},
		});

		signIn('email', input);
	}),
});

export type UserRouter = typeof userRouter;
