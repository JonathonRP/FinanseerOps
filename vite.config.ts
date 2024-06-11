import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import 'temporal-polyfill/global';
import Icons from 'unplugin-icons/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
		define: {
			'process.env': env,
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
		plugins: [
			basicSsl(),
			sentrySvelteKit({
				sourceMapsUploadOptions: {
					org: 'self-qw6',
					project: 'finanzen',
				},
			}),
			sveltekit(),
			Icons({ compiler: 'svelte', autoInstall: true }),
			tailwindcss(),
		],
	};
});
