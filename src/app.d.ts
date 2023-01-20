// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Error {
	// 	code?: string,
	// 	cause?: any,
	// 	devException?: Error
	// }
	interface Locals {
		getToken: () => Promise<string>;
	}
	// interface PageData {}
	// interface Platform {}
}
