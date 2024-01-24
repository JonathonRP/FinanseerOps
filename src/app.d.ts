/// <reference types="@auth/sveltekit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

import type { ZodIssue } from 'zod';

declare global {
	namespace App {
		interface Locals {
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
