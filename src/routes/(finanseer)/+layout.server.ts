import { dateFormat } from '$/lib/utils';
import { apiServer } from '$/server/api';
import { parse } from 'date-fns';

export async function load(event) {
	const {
		url: { searchParams },
		parent,
	} = event;
	const processedDate = searchParams.get('processedDate');
	const processedDay = (processedDate && parse(processedDate, dateFormat, new Date())) || new Date();
	const searchFilter = searchParams.get('search');

	return {
		...(await parent()),
		processedDate,
		processedDay,
		searchFilter,
		// accounts: await apiServer.buxfer.accounts.ssr(event),
		// transactions: await apiServer.buxfer.transactions.ssr({
		// 	startDate: startOfMonth(processedDay),
		// 	endDate: processedDay
		// }, event)
	};
}
