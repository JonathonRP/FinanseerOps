import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { PrismaClient, User, Account } from '@prisma/client';
import type { Adapter, AdapterAccount, AdapterSession } from '@auth/core/adapters';

type OGAdapter = Omit<Adapter, 'getUser' | 'getUserByEmail' | 'getUserByAccount' | 'getSessionAndUser'>;

export interface CustomAdapter extends OGAdapter {
	getUser(id: string): Promise<(User & { account: { access_token?: Account['access_token'] } | null }) | null>;
	getUserByEmail(email: string): Promise<(User & { account: { access_token: Account['access_token'] } | null }) | null>;
	getUserByAccount(
		providerAccountId: Pick<AdapterAccount, 'provider' | 'providerAccountId'>
	): Promise<(User & { account: { access_token: Account['access_token'] } | null }) | null>;
	getSessionAndUser(sessionToken: string): Promise<{
		session: AdapterSession;
		user: User & { account: { access_token: Account['access_token'] } | null };
	} | null>;
}

export default function CustomPrismaAdapter(client: PrismaClient): CustomAdapter {
	// eslint-disable-next-line
	// @ts-ignore
	return {
		...PrismaAdapter(client),
		async getUser(id: string) {
			const user = await client.user.findUnique({
				where: { id },
				include: {
					accounts: {
						where: {
							provider: 'buxfer',
						},
						select: {
							access_token: true,
						},
					},
				},
			});

			if (!user) return null;

			const [account] = user.accounts;
			return { ...user, account };
		},
		async getUserByEmail(email: string) {
			const user = await client.user.findUnique({
				where: { email },
				include: {
					accounts: {
						where: {
							provider: 'buxfer',
						},
						select: {
							access_token: true,
						},
					},
				},
			});

			if (!user) return null;

			const [account] = user.accounts;
			return { ...user, account };
		},
		async getUserByAccount(providerAccountId: Pick<AdapterAccount, 'provider' | 'providerAccountId'>) {
			const userAccount = await client.account.findUnique({
				where: { provider_providerAccountId: providerAccountId },
				select: {
					user: {
						include: {
							accounts: {
								where: {
									provider: 'buxfer',
								},
								select: {
									access_token: true,
								},
							},
						},
					},
				},
			});

			if (!userAccount?.user ?? undefined) return null;

			const [account] = userAccount?.user?.accounts ?? [];
			return { ...userAccount?.user, account };
		},
		async getSessionAndUser(sessionToken: string) {
			const userAndSession = await client.session.findUnique({
				where: { sessionToken },
				include: {
					user: {
						include: {
							accounts: {
								where: {
									provider: 'buxfer',
								},
								select: {
									access_token: true,
								},
							},
						},
					},
				},
			});

			if (!userAndSession) return null;

			const { user, ...session } = userAndSession;
			const [account] = user.accounts;
			return { user: { ...user, account }, session };
		},
	};
}
