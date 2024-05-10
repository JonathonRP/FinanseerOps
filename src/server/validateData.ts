import { error } from '@sveltejs/kit';
import { ZodError, type ZodSchema } from 'zod';

export const validateData = async (formData: FormData | unknown, schema: ZodSchema) => {
	const data =
		formData instanceof FormData
			? Object.fromEntries(
					Array.from(formData.entries()).map(([name, value]) => {
						const allValues = formData.getAll(name);
						return [name, allValues.length <= 1 ? value : allValues];
					})
				)
			: formData;

	try {
		const validData = await schema.parseAsync(data);
		return {
			data: validData,
			errors: null,
		};
	} catch (err) {
		if (err instanceof ZodError) {
			const { fieldErrors: errors } = err.flatten();
			return {
				data,
				errors,
			};
		}

		throw new Error(err.message);
	}
};
