import { error } from '@sveltejs/kit';
import { ulid } from 'ulid';

export async function load() {
	// eslint-disable-next-line @typescript-eslint/no-throw-literal
	error(404, { code: ulid(), message: 'Not Found' });
}
