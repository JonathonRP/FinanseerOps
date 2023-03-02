import { signIn } from '@auth/sveltekit/client';
import { Role } from '@prisma/client';
import {
	UserUpdateInputObjectSchema,
	UserUncheckedUpdateInputObjectSchema,
	UserWhereUniqueInputObjectSchema,
} from '$lib/prisma/generated/zod/schemas';
import { union } from 'zod';
import { adminProcedure, procedure, router } from '../trpc';

export const userRouter = router({
	update: procedure
		.input(union([UserUpdateInputObjectSchema, UserUncheckedUpdateInputObjectSchema]))
		.mutation(async ({ ctx, input }) => {
			await ctx.db?.user.update({
				where: {
					id: ctx.session?.user?.id,
				},
				data: input,
			});
		}),
	invite: adminProcedure.input(UserWhereUniqueInputObjectSchema).mutation(async ({ ctx, input }) => {
		if (await ctx.db?.user.findUnique({ where: input })) {
			throw new Error('Email is already invited');
		}

		await ctx.db?.user.create({
			data: {
				...input,
				isInvited: true,
				role: Role.user,
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
