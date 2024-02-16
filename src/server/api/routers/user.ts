import { signIn } from '@auth/sveltekit/client';
import { TRPCError } from '@trpc/server';
import { sql } from 'drizzle-orm';
import { coerce, object } from 'zod';
import { from, map } from 'rxjs';
import { familyLeaderProcedure, procedure, router } from '../trpc';
import { users, accounts, notifications } from '../../db/schema';
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
			.where(sql`${users.id} = ${id || ctx.user?.id}`)
			.then((res) => res[0]);
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

	notifications: procedure.subscription(async ({ ctx }) =>
		from(ctx.db.query.notifications.findMany({
			where: (notifs, { eq }) => eq(notifs.recipient, ctx.user?.id ?? ''),
			orderBy: (notifs, { desc }) => [desc(notifs.createdOn)],
		}))
	),

	latestNotification: procedure.subscription(async ({ ctx }) =>
		from(ctx.db.query.notifications
			.findMany({
				where: (notifs, { eq }) => eq(notifs.recipient, ctx.user?.id ?? '') && eq(notifs.read, false),
				orderBy: (notifs, { desc }) => [desc(notifs.createdOn)],
			})
		).pipe(map((res) => res[0]))
	),

	unreadNotificationsCount: procedure.subscription(({ ctx }) =>
		from(
			ctx.db
				.select({ totalUnread: sql`COUNT(1)` })
				.from(notifications)
				.where(sql`${notifications.recipient} = ${ctx.user?.id} and ${notifications.read} = ${false}`)
		).pipe(map((res) => res[0].totalUnread))
	),
});

export type UserRouter = typeof userRouter;
