import { SvelteKitAuth, type SvelteKitAuthConfig } from '@auth/sveltekit';
import Resend from '@auth/sveltekit/providers/resend';
import { ulid } from 'ulid';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { sendVerificationRequest } from './sendVerificationRequest';
import { EMAIL_FROM } from '$env/static/private';
import { db } from './db';

export const { handle, signIn, signOut } = SvelteKitAuth(async (event) => {
	const authOptions = {
		adapter: DrizzleAdapter(db),
		session: {
			strategy: 'database',
			generateSessionToken: () => ulid(),
		},
		providers: [
			Resend({
				from: EMAIL_FROM,
				sendVerificationRequest,
			}),
		],
		callbacks: {
			async session({ session, user }) {
				event.locals.session = session;
				event.locals.user = user;
				return {
					...session,
				};
			},
		},
		trustHost: true,
	} satisfies SvelteKitAuthConfig;
	return authOptions;
});
