import { createContext } from '$/server/api/context.js';
import { appRouter } from '$/server/api/root.js';
import { createCallerFactory } from '$/server/api/trpc.js';
import { datePeriods, endOfMonth, endOfWeek, startOfMonth, startOfWeek, today } from '$lib/utils';
import { map, share } from 'rxjs';

export async function load(event) {
	const {
		url: { searchParams, pathname, origin, search },
		parent,
	} = event;
	// TODO: default to = endOfMonth(today())
	// TODO: default from = startOfMonth(today()) or last 30 days?
	// TODO: processedDate => processedPeriod = { to, from }
	// TODO: thisMonth = { to: endOfMonth(today()), from: startOfMonth(today()) }
	// TODO: lastPeriod = { to: endOfMonth(today().subtract({ months: 1 })), from: startOfMonth(today().subtract({ months: 1 })) }
	// TODO: defaultProcessedPeriod = { to: thisMonth.to, from: lastPeriod.from }
	// TODO: processedPeriod = searchParams.get('processedPeriod') ?? defaultProcessedPeriod
	// TODO: calc deference to use for lastPeriod
	const defaultProcessedPeriod = {
		from: datePeriods.get('lastMonth')?.from,
		to: datePeriods.get('thisMonth')?.to,
	};
	const processedPeriod = searchParams.has('processedPeriod')
		? {
				from: Temporal.PlainDate.from(JSON.parse(searchParams.get('processedPeriod'))['from']),
				to: Temporal.PlainDate.from(JSON.parse(searchParams.get('processedPeriod'))['to']),
			}
		: defaultProcessedPeriod;
	const processedDay = searchParams.has('processedDate')
		? Temporal.PlainDate.from(searchParams.get('processedDate')!)
		: today();
	const searchFilter = searchParams.get('search');
	const { user } = await parent();
	const api = createCallerFactory(appRouter)(createContext(event));

	return {
		...(await parent()),
		processedDay: processedDay.toZonedDateTime(Temporal.Now.timeZoneId()).toString(),
		processedPeriod: encodeURIComponent(
			JSON.stringify({
				to: processedPeriod.to?.toZonedDateTime(Temporal.Now.timeZoneId()).toString,
				from: processedPeriod.from?.toZonedDateTime(Temporal.Now.timeZoneId()).toString(),
			})
		),
		searchFilter,
		current: {
			pathname,
			origin,
			search,
		},
		bankAccounts: new Promise(async (resolve, reject) =>
			(await api.buxfer.accounts()).pipe(share()).subscribe({
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
						resolve(result);
					},
					error: (err) => {
						console.log(err);
					},
				});
		}),
	};
}
