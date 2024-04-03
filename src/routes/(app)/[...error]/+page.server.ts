import { error } from '@sveltejs/kit';

export async function load() {
	// eslint-disable-next-line @typescript-eslint/no-throw-literal
	error(404, { code: '404', message: 'Not Found' });
}
