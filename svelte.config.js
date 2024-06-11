import 'temporal-polyfill/global';
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
			$: './src',
			'$/*': './src/*',
			$lib: './src/lib',
			'$lib/*': './src/lib/*',
		},
	},

	vitePlugin: {
		inspector: {
			showToggleButton: 'always',
			toggleButtonPos: 'bottom-right',
		},
	},
};

export default config;
