import '@auth/sveltekit'
import '@auth/sveltekit/adapters';
import type { Users } from '../src/server/db';

declare module '@auth/sveltekit/adapters' {
	type AdapterUser = Users;
}
