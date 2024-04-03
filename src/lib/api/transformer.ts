import { uneval, stringify, parse } from 'devalue';

export const transformer = {
	input: {
		serialize: (object: unknown) => stringify(object),
		deserialize: (object: string) => parse(object) as unknown,
	},
	output: {
		serialize: (object: unknown) => uneval(object),
		deserialize: (object: string) => (0, eval)(`(${object})`) as unknown,
	},
	// serialize: (object: unknown) => uneval(object),
	// eslint-disable-next-line no-eval
	// deserialize: (object: string) => eval(`(${object})`),

	// serialize: (object: unknown) => {
	// 	const result = uneval(object);
	// 	console.log(object, result);
	// 	return result;
	// },
	// deserialize: (object: string) => {
	// 	// eslint-disable-next-line no-eval
	// 	const result = eval(`(${object})`);
	// 	console.log(object, result);
	// 	return result;
	// },
};
