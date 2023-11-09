import { createContext } from '$/server/api/context';
import { validateData } from '$lib/utils';
import { logger } from '$/server/logger';
import { fail } from '@sveltejs/kit';
import { object, string, coerce } from 'zod';
import { TRPCError } from '@trpc/server';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { appRouter } from '$/server/api/root';

export const actions = {
	update: async (event) => {
		const { request, locals } = event;
		const formData = await request.formData();
		const { user } = locals.session;

		// NOTE - handle formdata checkbox boolean existance and inexistance states for boolean.
		const expectedUser = object({ useBauhaus: coerce.boolean().default(false), username: string() }).superRefine(
			({ username }, ctx) => {
				if (username === user?.name) {
					ctx.addIssue({ code: 'custom', message: 'No changes to save.', path: ['name', 'useBauhaus'] });
				}
			}
		);
		const result = await validateData(formData, expectedUser);
		const { data } = result;
		let { errors } = result;

		if (errors) {
			return fail(400, { formData: data, errors });
		}

		try {
			await appRouter.createCaller(createContext(event)).user.update({ ...user, ...{ ...data, name: data.username } });

			return { success: true };
		} catch (err) {
			logger.error(err);
			if (err instanceof TRPCError) {
				errors = { user: [err.message] };
				return fail(getHTTPStatusCodeFromError(err), { errors });
			}
			return fail(500, { errors });
		}
	},
	invite: async (event) => {
		const formData = await event.request.formData();
		const expectedInvintation = object({
			email: string({ required_error: 'Email is required.' }).nonempty('Email is required.').email({
				message: 'Email must be a valid email address.',
			}),
		});
		const result = await validateData(formData, expectedInvintation);
		const { data } = result;
		let { errors } = result;

		if (errors) {
			return fail(400, { formData: data, errors });
		}

		try {
			await appRouter.createCaller(createContext(event)).user.invite(data);

			return { success: true };
		} catch (err) {
			logger.error(err);
			if (err instanceof TRPCError) {
				errors = { email: [err.message] };
				return fail(getHTTPStatusCodeFromError(err), { errors });
			}
			return fail(500, { errors: err });
		}
	},
};
