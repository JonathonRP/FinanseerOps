import { redirect, fail } from '@sveltejs/kit';
import { validateData } from '$/server';
import { object, string } from 'zod';
import { decrypt } from '$lib/utils/cryption';
import { TRPCError } from '@trpc/server';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { appRouter, createCallerFactory } from '$/server/api/root.js';
import { createContext } from '$/server/api/context.js';

export const actions = {
	default: async (event) => {
		const { url, setHeaders, request } = event;
		const redirectTo = url.searchParams.get('redirectTo');
		const formData = await request.formData();

		const expectLogin = object({
			email: string().email().min(1),
			password: string().transform((val) => decrypt(val)),
		});
		const result = await validateData(formData, expectLogin);
		const { data } = result;
		const { errors } = result;

		if (errors) {
			return fail(400, { formData: data, errors });
		}

		try {
			const { email, password } = data;
			(await createCallerFactory(appRouter)(await createContext(event)).buxfer.login({ email, password })).subscribe({
				next: (token) => setHeaders({ Authorization: `Bearer: ${token}` }),
			});
			// const token = apiServer.buxfer.login.ssr(
			// 	{
			// 		email,
			// 		password,
			// 	},
			// 	event
			// );

			// setHeaders({Authorization: `Bearer: ${access}`});
			// event.cookies.set('refresh', refresh, {
			// 	path: '/api/trpc/',
			// 	httpOnly: true,
			// 	maxAge: 60 * 60 * 24 * 120,
			// 	sameSite: 'strict',
			// 	secure: !dev,
			// });

			// setHeaders({ Authorization: `Bearer: ${token}` });
		} catch (err) {
			if (err instanceof TRPCError) {
				const errors = { user: [err.message] };
				return fail(getHTTPStatusCodeFromError(err), { errors });
			}
			return fail(500, { errors });
		}

		if (redirectTo) {
			return redirect(302, `/${redirectTo.slice(1)}`);
		}
		return redirect(302, '/');
	},
};
