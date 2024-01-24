import { redirect } from "@sveltejs/kit";

export const GET = ({url}) => {
    redirect(302, `/auth/login${url.search}`);
}