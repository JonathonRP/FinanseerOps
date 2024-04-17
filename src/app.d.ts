/// <reference types="@auth/sveltekit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

import type { ZodIssue } from 'zod';
import type { Session } from '@auth/sveltekit';
import type { AdapterUser } from '@auth/sveltekit/adapters';
import type { Accounts, Transactions } from './lib/api';

declare global {
	namespace App {
		interface Locals {
			session: Session;
			user: AdapterUser;
			// locale: string;
			// timezone: string;
		}
		interface Error {
			message: string;
			code?: string;
			cause?: { [x: string]: any }[] | ZodIssue[];
			stack?: any;
		}
		interface PageData {
			processedDay: Date;
			accounts: Promise<Parameters<Parameters<Accounts['subscribe']>['0']>['0']>;
			transactions: Promise<Parameters<Parameters<Transactions['subscribe']>['0']>['0']>;
		}
		// interface Platform {}
	}
}
