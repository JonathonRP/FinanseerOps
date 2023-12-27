import { appRouter } from '$/server/api/root';
import { createContext } from '$/server/api/context';
import type { AdapterUser } from '@auth/core';
import { sql } from 'drizzle-orm';
import { addDays, isBefore } from 'date-fns';
import { accounts } from '$/server/db/schema';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$/server/db';

export async function refreshTokens(event: RequestEvent, user: AdapterUser) {
	const provider = 'buxfer';
	const account = await db
		.select({ access_token, refresh_token, expires_at, providerAccountId })
		.from(accounts)
		.where(
			sql`${accounts.provider} = ${provider} and (${accounts.userId} = ${user.id} || ${accounts.familyId} = ${user.familyId})`
		)
		.then((res) => res[0]);
	const userEmail = account?.providerAccountId || event.locals.session.user?.email;
	const token = () => {
		if (account) {
			if (account.expires_at && isBefore(new Date(), new Date(account.expires_at ?? 0))) {
				return account.access_token;
			}

			return account?.refresh_token;
		}

		return null;
	};

	if (!token() || token() !== account?.access_token) {
		const refreshedToken = await appRouter.createCaller(createContext(event)).buxfer.login({
			email: userEmail,
			password: token(),
		});

		await db
			.update(accounts)
			.set({
				access_token: refreshedToken,
				expires_at: Number(addDays(Date.now(), 1)),
			})
			.where(sql`${accounts.provider} = ${provider} AND ${accounts.providerAccountId} = ${userEmail}`);

		return refreshedToken;
	}

	event.cookies.set('accessToken', token(), { expires: new Date(account?.expires_at) });
}
