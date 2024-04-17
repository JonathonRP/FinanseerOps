import { createContext } from '$/server/api/context.js';
import { appRouter } from '$/server/api/root.js';
import { createCallerFactory } from '$/server/api/trpc.js';
import { endOfMonth, endOfWeek, startOfMonth, startOfToday, startOfWeek, subMonths } from 'date-fns';
import { share } from 'rxjs';

export async function load(event) {
	const {
		url: { searchParams, pathname, origin },
		parent,
	} = event;
	const processedDate = searchParams.get('processedDate');
	const processedDay = (processedDate && new Date(processedDate)) || startOfToday();
	const searchFilter = searchParams.get('search');
	const api = createCallerFactory(appRouter)(createContext(event));

	return {
		...(await parent()),
		processedDate,
		searchFilter,
		current: {
			pathname,
			origin,
		},
		accounts: new Promise(async (resolve, reject) =>
			(await api.buxfer.accounts()).pipe(share()).subscribe({
				next: (result) => {
					resolve(result);
				},
				error: (err) => {
					console.log(err);
				},
			})
		),
		transactions: new Promise(async (resolve, reject) => {
			(
				await api.buxfer.transactions({
					startDate: startOfWeek(startOfMonth(subMonths(processedDay, 1)), { weekStartsOn: 1 }),
					endDate: endOfWeek(endOfMonth(processedDay), { weekStartsOn: 1 }),
				})
			)
				.pipe(share())
				.subscribe({
					next: (result) => {
						resolve(result);
					},
					error: (err) => {
						console.log(err);
					},
				});
		}),
	};
}
