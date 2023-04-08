import { api } from '$lib/api';
import { parse } from 'date-fns';

export async function load(event) {
	const selectedDay = event.url.searchParams.get('selectedDay');
	const day = selectedDay ? parse(selectedDay, 'MM/dd/yyyy', new Date()) : undefined;

	return {
		api: api.ssr(event),
		day,
	};
}
