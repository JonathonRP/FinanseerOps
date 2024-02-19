import { sleep } from '$lib/utils';

export async function load({ locals: { session, user }, url: { searchParams } }) {
	let redirectTo = searchParams.getAll('redirectTo').pop();
	const redirectReason = searchParams.getAll('reason').pop();
	const reason = async () => {
		if (redirectReason) await sleep(1500);
		return redirectReason;
	};

	if (redirectTo) {
		redirectTo = `/${redirectTo?.slice(1)}`;
	}

	return {
		session,
		user,
		redirectTo,
		redirectReason: reason(),
	};
}
