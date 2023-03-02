import { signIn } from '@auth/sveltekit/client';
import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
		const data = Object.entries(await request.formData());
		signIn('email', { ...data });
	},
} satisfies Actions;
