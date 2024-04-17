import { object, string } from 'zod';
import { notifications } from '$/server/db/schema';
import { sql } from 'drizzle-orm';
import { procedure, router } from '../trpc';

export const notificationsRouter = router({
	delete: procedure.input(object({ id: string() })).mutation(async ({ ctx, input }) => {
		await ctx.db.delete(notifications).where(sql`${notifications.id} = ${input.id}`);
	}),
	seen: procedure.input(object({ id: string() })).mutation(async ({ ctx, input }) => {
		await ctx.db
			.update(notifications)
			.set({ seen: true })
			.where(sql`${notifications.id} = ${input.id}`);
	}),
});
