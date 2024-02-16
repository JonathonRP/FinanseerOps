export async function load({ locals: { session, user }, url: { searchParams } }) {
	let redirectTo = searchParams.get('redirectTo');
	if (redirectTo) {
		redirectTo = `/${redirectTo?.slice(1)}`;
	}
	return {
		session,
		user,
		redirectTo,
		redirectReason: searchParams.getAll('reason').pop(),
	};
}
