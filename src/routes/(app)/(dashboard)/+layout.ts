import { from, map, share } from 'rxjs';

export async function load({ data }) {
	return {
		...data,
		transactions: new Promise((resolve) =>
			from(data.transactions)
				.pipe(
					map(
						(transactions) =>
							transactions
								.filter(({ tags }) => !tags.includes('Paid'))
								.map((transaction) => ({
									...transaction,
									date: new Date(
										transaction.date.getUTCFullYear(),
										transaction.date.getUTCMonth(),
										transaction.date.getUTCDate(),
										transaction.date.getUTCHours(),
										transaction.date.getUTCMinutes(),
										transaction.date.getUTCSeconds(),
										transaction.date.getUTCMilliseconds()
									),
								}))
								.sort((a, b) => b.date.getTime() - a.date.getTime()),
						share()
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
