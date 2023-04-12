export async function load(event) {
	const searchFilter = event.url.searchParams.get('search');

	return {
		searchFilter,
	};
}
