import { error } from '@sveltejs/kit';
import { ZodError, type ZodSchema } from 'zod';

export const validateData = async (formData: FormData, schema: ZodSchema) => {
	const data = Object.fromEntries(formData);

	try {
		const validData = schema.parse(data);
		return {
			data: validData,
			errors: null,
		};
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);

		if (err instanceof ZodError) {
			const { fieldErrors: errors } = err.flatten();
			return {
				data,
				errors,
			};
		}

		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw error(500, { code: crypto.randomUUID(), message: 'How did it go so wrong!?' });
	}
};
