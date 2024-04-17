import { createContext } from '$/server/api/context';
import { appRouter, createCallerFactory } from '$/server/api/root';
import { validateData } from '$/server';
import { fail } from '@sveltejs/kit';
import { z, object, string, coerce } from 'zod';
import { TRPCError } from '@trpc/server';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';

export const actions = {
	update: async (event) => {
		const {
			request,
			locals: { session },
		} = event;
		const formData = await request.formData();
		const { user: sessionUser } = (await session) || { user: undefined };

		const { data: user, errors: userErrors } = await validateData(
			sessionUser,
			object({
				id: string(),
				email: string().nullable().optional(),
				emailVerified: coerce.date().nullable().optional(),
				name: string().nullable().optional(),
			}).partial()
		);

		if (userErrors) {
			return fail(400, { errors: userErrors });
		}

		// NOTE - handle formdata checkbox boolean existance and inexistance states for boolean.
		const expectedUserSettings = object({
			username: string(),
			widgetStyle: z.enum(['simple', 'dense']),
			permittedBankAccounts: coerce.number().array(),
			enableNotifications: coerce.boolean().default(false),
			emailRate: z.enum(['daily', 'weekly', 'bi-weekly', 'monthly', 'bi-monthly']),
			inAppRate: z.enum(['daily', 'weekly', 'bi-weekly', 'monthly', 'bi-monthly']),
		}).superRefine(
			({ username, widgetStyle, permittedBankAccounts, enableNotifications, emailRate, inAppRate }, ctx) => {
				if (
					username === user?.name &&
					widgetStyle === user?.widgetStyle &&
					permittedBankAccounts === user?.permittedBankAccounts &&
					enableNotifications === user?.enableNotifications &&
					emailRate === user?.emailRate &&
					inAppRate === user?.inAppRate
				) {
					ctx.addIssue({
						code: 'custom',
						message: 'No changes to save.',
						path: ['name', 'widgetStyle', 'permittedBankAccounts', 'enableNotifications', 'emailRate', 'inAppRate'],
					});
				}
			}
		);
		let { data, errors } = await validateData(formData, expectedUserSettings);

		if (errors) {
			return fail(400, { formData: data, errors });
		}

		try {
			await createCallerFactory(appRouter)(createContext(event)).user.update({
				...user,
				...{ name: data.username, ...data },
			});

			return { success: true };
		} catch (err) {
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
			email: string({ required_error: 'Email is required.' }).min(1, 'Email is required.').email({
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
			await createCallerFactory(appRouter)(createContext(event)).user.invite(data);

			return { success: true };
		} catch (err) {
			if (err instanceof TRPCError) {
				errors = { email: [err.message] };
				return fail(getHTTPStatusCodeFromError(err), { errors });
			}
			return fail(500, { errors });
		}
	},
};
