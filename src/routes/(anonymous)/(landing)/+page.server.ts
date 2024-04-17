import { db } from '$/server/db/index.js';
import { waitingList } from '$/server/db/schema.js';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({request}) => {
        const formData = await request.formData();
        await db.insert(waitingList).values({ email: formData.get('email') as string });

        return redirect(302, '/success')
    },
};