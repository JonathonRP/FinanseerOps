import type { CombinedDataTransformer } from '@trpc/server/dist/transformer';
// import { uneval } from 'devalue';
import SuperJSON from 'superjson';

export const transformer = {
	input: SuperJSON,
	output: SuperJSON,
	// {
	// 	serialize: (object) => uneval(object),
	// 	// eslint-disable-next-line no-eval
	// 	deserialize: (object) => eval(`${object}`),
	// },
} satisfies CombinedDataTransformer;
