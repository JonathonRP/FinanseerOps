import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess()],

	kit: {
		// { runtime: 'edge', regions: 'all' }
		adapter: adapter(),
		alias: {
			"$": "./src",
			"$/*": "./src/*",
			"$lib": "./src/lib",
			"$lib/*": "./src/lib/*",
		}
	},

	compilerOptions: {
		sourcemap: process.env.NODE_ENV === 'development' ? 'true' : 'false',
	},

	vitePlugin: {
		inspector: {
			showToggleButton: 'always',
			toggleButtonPos: 'top-right',
		},
	},
};

export default config;
