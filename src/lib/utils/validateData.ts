import { error } from '@sveltejs/kit';
import { ZodError, type ZodSchema } from 'zod';

export const validateData = async (formData: FormData, schema: ZodSchema) => {
	const body = Object.fromEntries(formData);

	try {
		const data = schema.parse(body);
		return {
			data,
			errors: null,
		};
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('Error: ', err);

		if (err instanceof ZodError) {
			const { fieldErrors: errors } = err.flatten();
			return {
				data: body,
				errors,
			};
		}

		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw error(500, { code: crypto.randomUUID(), message: 'How did is go so wrong!?' });
	}
};
