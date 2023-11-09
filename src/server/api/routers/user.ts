import { signIn } from '@auth/sveltekit/client';
import { TRPCError } from '@trpc/server';
import { sql } from 'drizzle-orm';
import { coerce, object } from 'zod';
import { familyLeaderProcedure, procedure, router } from '../trpc';
import { users, accounts } from '../../db/schema';
import { user } from '../../db';

export const userRouter = router({
	retrieve: procedure.input(user.pick({ id: true }).optional()).query(async ({ ctx, input }) =>
		ctx.db
			.select()
			.from(users)
			.where(sql`${users.id} = ${input?.id || ctx.user?.id}`)
			.then((res) => res.at(0))
	),
	update: procedure.input(user.partial()).mutation(async ({ ctx, input: { id, ...data } }) => {
		const existing = await ctx.db
			.select()
			.from(users)
			.where(sql`${users.id} = ${id || ctx.user?.id}`);
		await ctx.db
			.update(users)
			.set(Object.assign(existing, data))
			.where(sql`${users.id} = ${id || ctx.user?.id}`);
	}),
	invite: familyLeaderProcedure
		.input(user.pick({ email: true }).pipe(object({ email: coerce.string().email() })))
		.mutation(async ({ ctx, input: { email } }) => {
			// if (
			// 	await ctx.db
			// 		.select({
			// 			default: sql`1`,
			// 		})
			// 		.from(users)
			// 		.where(sql`${users.email} = ${email}`)
			// ) {
			// 	throw new TRPCError({
			// 		code: 'BAD_REQUEST',
			// 		message: 'Email is already invited',
			// 	});
			// }
			// const userId = crypto.randomUUID();
			// await ctx.db.insert(users).values({ email, id: userId, role: 'user' });
			// await ctx.db
			// 	.insert(accounts)
			// 	.values({ userId, type: 'email', provider: 'invitation', providerAccountId: email.normalize() });
			// await signIn('email', { email });
		}),
});

export type UserRouter = typeof userRouter;
