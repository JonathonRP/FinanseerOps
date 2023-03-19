import { appRouter } from '$lib/server/api/root';
import { createContext } from '$lib/server/api/trpc';
import useBauhausStore from '$lib/stores/useBauhaus';
import { validateData } from '$lib/utils';
import { logger } from '$lib/server/logger';
import { error, fail } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { boolean, object, string } from 'zod';
import type { Actions } from './user/$types';

const expectedInvintation = object({
	email: string({ required_error: 'Email is required.' }).email({
		message: 'Email must be a valid email address.',
	}),
});

// FIXME - why error when submitting to these form actions from +layout.svelte?
export const actions = {
	updateUser: async (event) => {
		const { formData } = event.request;
		const { user } = event.locals.session;
		const expectedUser = object({ useBauhaus: boolean(), name: string() }).superRefine(({ useBauhaus, name }, ctx) => {
			if (name === user?.name && useBauhaus === get(useBauhausStore)) {
				ctx.addIssue({ code: 'custom', message: 'No changes to save.', path: ['name', 'useBauhaus'] });
			}
		});
		const { data, errors } = await validateData(await formData(), expectedUser);

		if (errors) {
			return fail(400, { formData: data, errors });
		}

		try {
			if (user && user.name !== data.name) {
				appRouter.createCaller(await createContext(event)).user.update({ ...user, ...data });
			}

			useBauhausStore.set(Boolean(data.useBauhaus));

			return { success: true };
		} catch (err) {
			logger.error(err);
			// eslint-disable-next-line @typescript-eslint/no-throw-literal
			throw error(500, { code: crypto.randomUUID(), message: 'Wow! you REALLY broke this!?' });
		}
	},
	inviteNewUser: async (event) => {
		const { formData } = event.request;
		const { data, errors } = await validateData(await formData(), expectedInvintation);

		if (errors) {
			return fail(400, { formData: data, errors });
		}

		try {
			appRouter.createCaller(await createContext(event)).user.invite(data);

			return { success: true };
		} catch (err) {
			logger.error(err);
			// eslint-disable-next-line @typescript-eslint/no-throw-literal
			throw error(500, { code: crypto.randomUUID(), message: 'Wow! you REALLY broke this!?' });
		}
	},
} satisfies Actions;
