export async function load({ url: { searchParams } }) {
	const searchFilter = searchParams.get('search');

	return {
		searchFilter,
	};
}
