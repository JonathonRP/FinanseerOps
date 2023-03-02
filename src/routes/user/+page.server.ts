import { appRouter } from '$lib/server/api/root';
import { createContext } from '$lib/server/api/trpc';
import useBauhaus from '$lib/stores/useBauhaus';
import type { Actions } from './$types';

export const actions = {
	update: async (event) => {
		const { formData } = event.request;
		const { user } = event.locals.session;
		const data = Object.fromEntries(await formData());

		useBauhaus.set(Boolean(data.useBauhaus));

		if (user?.name !== data.name) {
			appRouter.createCaller(await createContext(event)).user.update({ ...user, ...data });
		}

		return { success: true };
	},
	invite: async (event) => {
		const { formData } = event.request;
		const data = Object.fromEntries(await formData());

		if (data.email ?? false) {
			appRouter.createCaller(await createContext(event)).user.invite(data);
		}

		return { success: true };
	},
} satisfies Actions;
