import { redirect } from '@sveltejs/kit';

export const GET = ({ url }) => {
	redirect(302, `/auth/login${url.search}`);
};

export const POST = async ({ fetch, url, locals, request }) => {
	const headers = [
		['host', request.headers.get('host') ?? ''],
		['Referer', request.headers.get('Referer') ?? ''],
		['X-Auth-Return-Redirect', request.headers.get('X-Auth-Return-Redirect') ?? ''],
		...request.headers.getSetCookie().map((value) => ['Set-Cookie', value] as [string, string]),
	] satisfies HeadersInit;

	if (await locals.auth()) {
		return await fetch(`/auth/logout${url.search}`, {
			headers,
			method: request.method,
			body: await request.formData(),
			mode: request.mode,
		});
	} else {
		return await fetch(`/auth/login${url.search}`, {
			headers,
			method: request.method,
			body: await request.formData(),
			mode: request.mode,
		});
	}
};
