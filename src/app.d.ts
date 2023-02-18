// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import '@auth/core/types';

// and what to do when importing types
declare namespace App {
	// interface Error {
	// 	code?: string,
	// 	cause?: any,
	// 	devException?: Error
	// }
	// interface Locals {
	// 	getToken: () => Promise<string>;
	// }
	// interface PageData {}
	// interface Platform {}
}

declare module '@auth/core/types' {
	interface Session {
		user?: {
			role: 'admin' | 'user' = 'user';
			isInvited: boolean = false;
			emailVerified: Date? = undefined;
			buxfer: {
				token: string;
			};
		} & DefaultSession['user'];
	}
}
