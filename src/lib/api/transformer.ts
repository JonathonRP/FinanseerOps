import { stringify, parse } from 'devalue';

export const transformer = {
	// serialize: (object: unknown) => uneval(object),
	// eslint-disable-next-line no-eval
	// deserialize: (object: string) => eval(`${object}`),
	serialize: (object: unknown) => stringify(object),
	deserialize: (object: string) => parse(object),
};
