import { dateFormat } from '$lib/utils';
import { parse } from 'date-fns';

export async function load({ url: { searchParams } }) {
	const processedDate = searchParams.get('processedDate');
	const searchFilter = searchParams.get('search');
	return {
		processedDate,
		processedDay: (processedDate && parse(processedDate, dateFormat, new Date())) || new Date(),
		searchFilter,
	};
}
