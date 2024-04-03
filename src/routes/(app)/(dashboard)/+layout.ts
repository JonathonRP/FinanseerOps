import { from, map } from 'rxjs';

export async function load({ data }) {
	return {
		...data,
		transactions: new Promise((resolve) =>
			from(data.transactions)
				.pipe(
					map((transacts) =>
						transacts
							.filter(t => !t.isPending)
							.map((t) => ({
								...t,
								date: new Date(
									t.date.getUTCFullYear(),
									t.date.getUTCMonth(),
									t.date.getUTCDate(),
									t.date.getUTCHours(),
									t.date.getUTCMinutes(),
									t.date.getUTCSeconds(),
									t.date.getUTCMilliseconds()
								),
							}))
							.sort((a, b) => b.date.getTime() - a.date.getTime())
					)
				)
				.subscribe({
					next: (value) => {
						resolve(value);
					},
				})
		),
	};
}
