// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

import type { Session } from '@auth/core/types';
import type { ZodIssue } from 'zod';

declare global {
	namespace App {
		interface Locals {
			locale: string;
			timezone: string;
			session: Session;
		}

		interface PageData {
			locale: string;
			timezone: string;
		}
		interface Error {
			message: string;
			code?: string;
			cause?: { [x: string]: any }[] | ZodIssue[];
		}
		// interface PageData {}
		// interface Platform {}
	}
}
