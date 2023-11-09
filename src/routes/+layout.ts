export async function load(event) {
	return {
		...event.data,
		url: event.url,
	};
}
