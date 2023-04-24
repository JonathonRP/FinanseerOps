import type { DefaultSession, DefaultUser } from '@auth/core/types';
import type { User as PrismaUser, Account as PrismaAccount } from '@prisma/client';
import { SvelteKitAuthConfig as OGSvelteKitAuthConfig } from '@auth/sveltekit';
import type { CustomAdapter } from '$lib/prisma/client';

declare module '@auth/core/types' {
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
