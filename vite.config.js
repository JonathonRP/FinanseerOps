import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],

	server: {
		port: 5000,
		strictPort: true,
		// hmr: {
		// 	clientPort: 5000,
		// 	port: 5001,
		// },
		// watch: {
		// 	usePolling: true,
		// },
		// proxy: {
		//   "/api": "https://www.buxfer.com",
		// },
	},
};

export default config;
