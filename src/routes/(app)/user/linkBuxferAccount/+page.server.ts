import { redirect, fail } from '@sveltejs/kit';
import { appRouter } from '$/server/api/root';
import { createContext } from '$/server/api/context';
import { object, string } from 'zod';
import jwt from 'jsonwebtoken';
import { decrypt } from '$/lib/utils/cryption';
import { validateData } from '$lib/utils';
import { logger } from '$/server/logger';
import { TRPCError } from '@trpc/server';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { dev } from '$app/environment';
import { SECRET } from '$env/static/private';

export const actions = {
	default: async (event) => {
		const { url, setHeaders, request } = event;
		const redirectTo = url.searchParams.get('redirectTo');
		const formData = await request.formData();

		const expectLogin = object({ email: string().email().min(1), password: string().min(1) });
		const result = await validateData(formData, expectLogin);
		const { data } = result;
		let { errors } = result;

		if (errors) {
			return fail(400, { formData: data, errors });
		}

		try {
			const { email, password: secret } = data;
			const token = await appRouter
				.createCaller(createContext(event))
				.buxfer.login({ email, password: decrypt(secret) });

			setHeaders('X-BuxferAuthorization', `Bearer: ${jwt.sign(token, SECRET, { expiresIn: 10 })}`);
			event.cookies.set(jwt.sign({ email, secret }, SECRET, { expiresIn: '120d' }), {
				path: '/api/trpc/',
				httpOnly: true,
				maxAge: 60 * 60 * 24 * 120,
				sameSite: 'strict',
				secure: !dev,
			});
		} catch (err) {
			logger.error(err);
			if (err instanceof TRPCError) {
				errors = { user: [err.message] };
				return fail(getHTTPStatusCodeFromError(err), { errors });
			}
			return fail(500, { errors });
		}

		if (redirectTo) {
			throw redirect(302, `/${redirectTo.slice(1)}`);
		}
		throw redirect(302, '/');
	},
};
