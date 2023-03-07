import { buxferLogin, buxferToken, buxferAccounts, buxferTransactions, client } from '$lib/Buxfer';
import { z, date, number, object, string } from 'zod';
import { procedure, router } from '../trpc';

export const buxferAccountRouter = router({
	login: procedure
		.input(buxferLogin)
		.output(string())
		.mutation(async ({ ctx, input }) => {
			type BuxferToken = z.infer<typeof buxferToken>;

			// FIXME - why is token returning as undefined?
			const token = await Promise.resolve(
				ctx.buxferToken || (await client<BuxferToken>({ endpoint: '/api/login', init: { body: input } })).token
			);

			const user = {
				id: ctx.session?.user?.id,
				isInvited: false,
				providerAccountId: ctx.session?.user?.email?.normalize() || '',
			};

			if (ctx.session?.user?.isInvited) {
				await ctx.db?.user.update({
					where: {
						id: user.id,
					},
					data: {
						isInvited: user.isInvited,
					},
				});
			}
			ctx.db?.account.upsert({
				where: {
					provider_providerAccountId: {
						provider: 'buxfer',
						providerAccountId: user?.providerAccountId,
					},
				},
				update: {
					access_token: token,
				},
				create: {
					type: 'email',
					provider: 'buxfer',
					providerAccountId: user?.providerAccountId,
					access_token: token,
					user: {
						connect: {
							id: user?.id,
						},
					},
				},
			});

			return token;
		}),

	transactions: procedure
		.input(
			object({
				start: date(),
				end: date(),
				page: number(),
			})
		)
		.output(buxferTransactions)
		.query(async ({ ctx, input }) => {
			const startDate = input.start.toDateString();
			const endDate = input.end.toDateString();

			return client({
				endpoint: '/api/transactions',
				init: {
					body: {
						token: ctx.buxferToken,
						...{
							...input,
							startDate,
							endDate,
						},
					},
				},
			});
		}),

	accounts: procedure
		.output(buxferAccounts)
		.query(async ({ ctx }) => client({ endpoint: '/api/accounts', init: { body: { token: ctx.buxferToken } } })),
});

export type BuxferAccountRouter = typeof buxferAccountRouter;
