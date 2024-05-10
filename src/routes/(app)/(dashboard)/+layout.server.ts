import { startOfMonth, startOfWeek, endOfMonth, endOfWeek, today } from '$lib/utils';
import { createContext } from '$/server/api/context.js';
import { appRouter } from '$/server/api/root.js';
import { createCallerFactory } from '$/server/api/trpc.js';
import { map, share } from 'rxjs';

export async function load(event) {
	const {
		url: { searchParams, pathname, origin, search },
		parent,
	} = event;
	const processedDate = searchParams.get('processedDate');
	const processedDay = processedDate ? Temporal.PlainDate.from(processedDate) : today();
	const searchFilter = searchParams.get('search');
	const { user } = await parent();
	const api = createCallerFactory(appRouter)(createContext(event));

	return {
		...parent(),
		processedDate,
		searchFilter,
		current: {
			pathname,
			origin,
			search,
		},
		bankAccounts: new Promise(async (resolve, reject) =>
			(await api.buxfer.accounts())
				.pipe(
					map((accounts) => accounts.filter(({ id }) => user?.permittedBankAccounts?.includes(id) ?? true)),
					share()
				)
				.subscribe({
					next: (result) => {
						resolve(result);
					},
					error: (err) => {
						console.log(err);
					},
				})
		),
		bankTransactions: new Promise(async (resolve, reject) => {
			(
				await api.buxfer.transactions({
					startDate: startOfWeek(startOfMonth(processedDay.subtract({ months: 1 }))),
					endDate: endOfWeek(endOfMonth(processedDay)),
				})
			)
				.pipe(
					map((transactions) =>
						transactions
							.filter(({ accountId }) => user?.permittedBankAccounts?.includes(accountId) ?? true)
							.sort(({ date: a }, { date: b }) => Temporal.PlainDate.compare(b, a))
					),
					share()
				)
				.subscribe({
					next: (result) => {
						resolve(result ?? []);
					},
					error: (err) => {
						console.log(err);
					},
				});
		}),
	};
}
