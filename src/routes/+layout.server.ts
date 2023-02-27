import { appRouter } from '$lib/server/api/root';
import { createContext } from '$lib/server/api/trpc';
import { getAccounts } from '$lib/stores/accounts';
import { getTransactions } from '$lib/stores/transactions';
import type { Actions } from '@sveltejs/kit';
import { startOfMonth, sub } from 'date-fns';
import { lastValueFrom, take } from 'rxjs';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
	const today = new Date();

	return {
		today,
		session: event.locals.session,
		accounts: lastValueFrom(getAccounts(event).pipe(take(1))),
		transactions: lastValueFrom(getTransactions([startOfMonth(sub(today, { months: 1 })), today], event).pipe(take(1))),
	};
}) satisfies LayoutServerLoad;

export const actions = {
	updateUser: async (event) => {
		const { formData } = event.request;
		const { user } = event.locals.session;
		const data = Object.fromEntries(await formData());

		if (user?.name !== data.name) {
			appRouter.createCaller(await createContext(event)).user.update({ ...user, ...data });
		}

		return { success: true };
	},
	inviteUser: async (event) => {
		const { formData } = event.request;
		const data = Object.fromEntries(await formData());

		if (data.email ?? false) {
			appRouter.createCaller(await createContext(event)).user.invite({ ...data });
		}

		return { success: true };
	},
} satisfies Actions;
