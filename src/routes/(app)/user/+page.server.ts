import { appRouter } from '$lib/server/api';
import { createContext } from '$lib/server/api/trpc';
import { validateData } from '$lib/utils';
import { logger } from '$lib/server/logger';
import { error, fail } from '@sveltejs/kit';
import { object, string, coerce } from 'zod';

export const actions = {
	update: async (event) => {
		const formData = await event.request.formData();
		const { user } = event.locals.session;

		// NOTE - handle formdata checkbox boolean existance and inexistance states for boolean.
		const expectedUser = object({ useBauhaus: coerce.boolean().default(false), name: string() }).superRefine(
			({ name }, ctx) => {
				if (name === user?.name) {
					ctx.addIssue({ code: 'custom', message: 'No changes to save.', path: ['name', 'useBauhaus'] });
				}
			}
		);
		const { data, errors } = await validateData(formData, expectedUser);

		if (errors) {
			return fail(400, { formData: data, errors });
		}

		try {
			if (user && user.name !== data.name) {
				appRouter.createCaller(await createContext(event)).user.update({ ...user, ...data });
			}

			return { success: true };
		} catch (err) {
			logger.error(err);
			// eslint-disable-next-line @typescript-eslint/no-throw-literal
			throw error(500, { code: crypto.randomUUID(), message: 'Wow! you REALLY broke this!?' });
		}
	},
	invite: async (event) => {
		const formData = await event.request.formData();
		const expectedInvintation = object({
			email: string({ required_error: 'Email is required.' }).nonempty('Email is required.').email({
				message: 'Email must be a valid email address.',
			}),
		});
		const { data, errors } = await validateData(formData, expectedInvintation);

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
};
