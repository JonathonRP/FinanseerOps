import { redirect } from '@sveltejs/kit';

export const GET = ({ url }) => {
	redirect(302, `/auth/login${url.search}`);
};

export const POST = async ({ url, locals: { auth } }) =>
	redirect(307, `/auth/log${(await auth()) ? 'out' : 'in'}${url.search}`);
