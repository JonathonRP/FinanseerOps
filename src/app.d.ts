// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

import type { Session } from '@dependencies/types';

declare global {
	namespace App {
		interface Locals {
			session: Session;
		}
		interface Error {
			message: string;
			code: string;
		}
		// interface PageData {}
		// interface Platform {}
	}
}
