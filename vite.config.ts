import { defineConfig, loadEnv } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import Icons from 'unplugin-icons/vite';
import { sentrySvelteKit } from '@sentry/sveltekit';
// import basicSsl from '@vitejs/plugin-basic-ssl';
import 'temporal-polyfill/global';

export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
		define: {
			'process.env': env,
		},
		// optimizeDeps: {
		// 	exclude: ['temporal-polyfill/global'],
		// },
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
		// esbuild: {
		// 	define: {
		// 		Temporal: 'Temporal',
		// 	},
		// },
		plugins: [
			sentrySvelteKit({
				sourceMapsUploadOptions: {
					org: 'self-qw6',
					project: 'finanzen',
				},
			}),
			sveltekit(),
			Icons({ compiler: 'svelte', autoInstall: true }),
			nodePolyfills({ include: ['stream'] }),
		],
	};
});
