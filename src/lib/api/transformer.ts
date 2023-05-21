import { uneval } from 'devalue';

export const transformer = {
	serialize: (object: unknown) => uneval(object),
	// eslint-disable-next-line no-eval
	deserialize: (object: string) => eval(`(${object})`),
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
