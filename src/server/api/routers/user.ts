import { sql } from 'drizzle-orm';
import { coerce, object } from 'zod';
import { concat, shareReplay, switchMap, map } from 'rxjs';
import { notificationsChanges, notificationsInserted } from '$/server/db/events';
import { familyLeaderProcedure, procedure, router } from '../trpc';
import { users, notifications, buxferAccounts } from '../../db/schema';
import { buxferAccount, notification, user } from '../../db';

export const userRouter = router({
	retrieve: procedure.input(user.pick({ id: true }).optional()).query(({ ctx, input }) =>
		ctx.db
			.select()
			.from(users)
			.where(sql`${users.id} = ${input?.id || ctx.user?.id}`)
			.then((res) => res.at(0))
	),
	update: procedure.input(user.partial()).mutation(async ({ ctx, input: { id, ...data } }) => {
		// TODO - mirror changes to authjs.user
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
	buxferAccount: procedure.input(user.pick({ id: true }).optional()).query(({ ctx, input }) =>
		ctx.db.query.buxferAccounts.findFirst({
			where: sql`${buxferAccounts.userId} = ${input?.id || ctx.user?.id}`,
		})
	),
	addBuxferAccount: procedure
		.input(buxferAccount.pick({ userId: true, accessToken: true, refreshToken: true }))
		.mutation(async ({ ctx, input: { userId, accessToken, refreshToken } }) => {
			await ctx.db
				.insert(buxferAccounts)
				.values({
					userId: userId || ctx.user.id,
					accessToken,
					refreshToken,
				})
				.onConflictDoUpdate({
					target: buxferAccounts.userId,
					set: {
						...(accessToken && { accessToken }),
						...(refreshToken && { refreshToken }),
					},
					where: sql`${buxferAccounts.userId} = ${userId || ctx.user.id}`,
				});
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

	notifications: procedure.subscription(({ ctx }) =>
		concat(
			ctx.db.query.notifications.findMany({
				where: sql`${notifications.recipientId} = ${ctx.user?.id ?? ''}`,
				orderBy: (notifs, { desc }) => [desc(notifs.createdOn)],
			}),
			notificationsChanges.pipe(
				switchMap(() =>
					ctx.db.query.notifications.findMany({
						where: sql`${notifications.recipientId} = ${ctx.user?.id ?? ''}`,
						orderBy: (notifs, { desc }) => [desc(notifs.createdOn)],
					})
				)
			)
		)
	),

	addNotification: procedure.input(notification).mutation(async ({ ctx, input }) => {
		await ctx.db.insert(notifications).values(input).onConflictDoNothing();
	}),

	latestNotification: procedure.subscription(({ ctx }) =>
		notificationsInserted.pipe(
			map(({ new: newNotification }) => newNotification.message as string),
			shareReplay(1)
		)
	),

	unreadNotificationsCount: procedure.subscription(({ ctx }) =>
		concat(
			ctx.db
				.select({ totalUnread: sql<number>`COUNT(1)` })
				.from(notifications)
				.where(sql`${notifications.recipientId} = ${ctx.user?.id} and ${notifications.seen} = ${false}`)
				.then((res) => res[0].totalUnread),
			notificationsChanges.pipe(
				switchMap(() =>
					ctx.db
						.select({ totalUnread: sql<number>`COUNT(1)` })
						.from(notifications)
						.where(sql`${notifications.recipientId} = ${ctx.user?.id} and ${notifications.seen} = ${false}`)
						.then((res) => res[0].totalUnread)
				)
			)
		)
	),
});

export type UserRouter = typeof userRouter;
