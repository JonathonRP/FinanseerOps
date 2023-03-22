import type { CombinedDataTransformer } from '@trpc/server/dist/transformer';
import { uneval } from 'devalue';

export const devalue = {
	input: {
		serialize: (object) => uneval(object),
		// eslint-disable-next-line no-eval
		deserialize: (object) => eval(`${object}`),
	},
	output: {
		serialize: (object) => uneval(object),
		// eslint-disable-next-line no-eval
		deserialize: (object) => eval(`${object}`),
	},
} satisfies CombinedDataTransformer;
