import { defineConfig, loadEnv } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import Icons from 'unplugin-icons/vite';
import { sentrySvelteKit } from '@sentry/sveltekit';

export default defineConfig(({command, mode}) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
		define: {
			'process.env': env
		},
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
		optimizeDeps: {
			exclude: ['@sentry/sveltekit']
		},
		plugins: [
			sentrySvelteKit({
				sourceMapsUploadOptions: {
					org: 'self-qw6',
					project: 'finanzen',
				}
			}),
			Icons({ compiler: 'svelte', autoInstall: true }),
			sveltekit()
		],
	}
});
