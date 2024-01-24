import { validateData } from '$/server';
import { fail } from '@sveltejs/kit';
import { object, string } from 'zod';

export const actions = {
	default: async ({ url, request }) => {
        const formData = await request.formData();
        const expectedData = object({ email: string().email() })

        const result = await validateData(formData, expectedData);
		const { data } = result;
		const { errors } = result;

		if (errors) {
			return fail(400, { ...data, errors });
		}

        return { success: true, ...data };
	},
};