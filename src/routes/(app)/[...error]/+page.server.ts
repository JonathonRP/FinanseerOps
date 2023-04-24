import { error } from '@sveltejs/kit';

export async function load() {
	// eslint-disable-next-line @typescript-eslint/no-throw-literal
	throw error(404, { code: crypto.randomUUID(), message: 'Not Found' });
}
