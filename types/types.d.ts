import type { DefaultSession, DefaultUser } from '@auth/core/types';
import type { User as PrismaUser, Account as PrismaAccount } from '@prisma/client';
import { SvelteKitAuthConfig as OGSvelteKitAuthConfig } from '@auth/sveltekit';
import type { CustomAdapter } from '$lib/prisma/client';

// TODO: update when they fix this:
// https://github.com/nextauthjs/next-auth/issues/6640#issuecomment-1426801813
// @dependencies/types -> ../node_modules/.pnpm/@auth+core@0.3.0_nodemailer@6.9.1/node_modules/@auth/core/types
declare module '../node_modules/.pnpm/@auth+core@0.3.0_nodemailer@6.9.1/node_modules/@auth/core/types' {
	interface Session extends DefaultSession {
		user?: {
			buxferToken: string | null;
		} & {
			[K in keyof Omit<PrismaUser, keyof Omit<DefaultUser, 'id'>>]: Omit<PrismaUser, keyof Omit<DefaultUser, 'id'>>[K];
		} & DefaultSession['user'];
	}
	interface User extends PrismaUser, DefaultUser {
		account: Pick<PrismaAccount, 'access_token'>;
	}
}

declare module '@sveltejs/kit' {
	interface Redirect extends Error {
		status: 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308;
		location: string;
	}
}

declare module '@auth/sveltekit' {
	interface SvelteKitAuthConfig extends OGSvelteKitAuthConfig {
		adapter: CustomAdapter;
	}
}
