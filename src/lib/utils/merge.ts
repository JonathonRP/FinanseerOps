type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export const merge = <T, U>(source: T[], ...rest: Partial<U>[][]) =>
	source.filter(Boolean).reduce(
		(s_acc, s_curr, s_index) =>
			s_acc.filter(Boolean).concat(
				<Extract<T | U, Primitive>>rest.filter(Boolean).reduce(
					(r_acc, r_curr) =>
						r_acc.concat({
							...s_curr,
							...r_curr[s_index],
						}),
					[]
				)
			),
		<Extract<T | U, Primitive>[]>[]
	);
