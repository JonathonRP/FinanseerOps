import { api } from '$lib/api';
import { parse } from 'date-fns';
import { dateFormat } from '$lib/utils';

export async function load(event) {
	const finanseer = event.route.id?.includes('finanseer');
	const processedDate = event.url.searchParams.get('processedDate');
	const processedDay = processedDate ? parse(processedDate, dateFormat, new Date()) : new Date();

	return {
		api: api.ssr(event),
		finanseer,
		processedDate,
		processedDay,
	};
}
