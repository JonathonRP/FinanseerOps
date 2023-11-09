import { sveltekit } from '@sveltejs/kit/vite';
import Icons from 'unplugin-icons/vite';
import type { UserConfig } from 'vite';

const config = {
	plugins: [sveltekit(), Icons({ compiler: 'svelte', autoInstall: true })],

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
} satisfies UserConfig;

export default config;
