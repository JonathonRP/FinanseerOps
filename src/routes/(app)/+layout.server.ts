import { dateFormat } from "$lib/utils/index.svelte";
import { isBefore, parse } from "date-fns";
import { redirect } from "@sveltejs/kit";

export async function load({ parent }) {
    const data = await parent();
	if (!data.session?.user || isBefore(parse(data.session?.expires, dateFormat, Date.now()), Date.now())) {
		return redirect(302, '/auth/signin');
	}

    return {
        ...data,
    }
}