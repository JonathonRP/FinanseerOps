import { signIn } from '@auth/sveltekit/client';

export const actions = {
	default: async ({ request }) => {
		const data = Object.entries(await request.formData());
		signIn('email', { ...data });

		return {
			success: true
		}
	},
};
