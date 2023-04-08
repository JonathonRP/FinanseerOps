export const merge = <T>(source: T[], ...rest: Partial<T>[][]) =>
	source.reduce(
		(s_acc, s_curr) =>
			s_acc.concat(
				rest.filter(Boolean).reduce(
					(r_acc, r_curr, r_curr_index) =>
						r_acc.concat({
							...s_curr,
							...r_curr[r_curr_index],
						}),
					[]
				) as T
			),
		<T[]>[]
	);
