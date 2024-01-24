import { dateFormat } from '$lib/utils/index.svelte';
import { parse } from 'date-fns';

export async function load({ url: {searchParams}, data }) {
	const processedDate = searchParams.get('processedDate');
	const processedDay = (processedDate && parse(processedDate, dateFormat, new Date())) || new Date();
	const searchFilter = searchParams.get('search');

	return {
		...data,
		processedDate,
		processedDay,
		searchFilter,
	};
}
