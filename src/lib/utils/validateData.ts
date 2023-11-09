import { api } from '$lib/api';
import { error } from '@sveltejs/kit';
import { ZodError, type ZodSchema } from 'zod';
import { ulid } from 'ulid';

export const validateData = async (formData: FormData, schema: ZodSchema) => {
	const data = Object.fromEntries(formData);

	try {
		const validData = schema.parse(data);
		return {
			data: validData,
			errors: null,
		};
	} catch (err) {
		api.logger.error.query(err);

		if (err instanceof ZodError) {
			const { fieldErrors: errors } = err.flatten();
			return {
				data,
				errors,
			};
		}

		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw error(500, { code: ulid(), message: 'How did it go so wrong!?' });
	}
};
