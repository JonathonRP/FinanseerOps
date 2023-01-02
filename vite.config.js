import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	server: {
		port: '5000',
		proxy: {
			'/api': 'https://www.buxfer.com'
		}
	}
};

export default config;
