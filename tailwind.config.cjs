const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				primary: {
					100: '#ffd8cc',
					200: '#ffb299',
					300: '#ff8b66',
					400: '#ff6533',
					500: '#ff3e00',
					600: '#cc3200',
					700: '#992500',
					800: '#661900',
					900: '#330c00',
				},
				neutral: {
					808: '#2e2e2e',
					309: '#cccccc',
				},
			},
			animation: {
				pulse: 'pulse 1.3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'gradient-x': 'gradient-x 1.3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			},
			keyframes: {
				pulse: {
					'0%, 100%': {
						opacity: '0',
					},
					'50%': {
						opacity: '1',
					},
				},
				'gradient-x': {
					'100%': {
						'background-size': '200% 200%',
						'background-position': 'left center',
					},
					'0%': {
						'background-size': '200% 200%',
						'background-position': 'right center',
					},
				},
			},
		},
	},

	plugins: [
		plugin(({ matchUtilities, theme }) => {
			matchUtilities(
				{
					'animation-delay': (value) => {
						return {
							'animation-delay': value,
						};
					},
				},
				{
					values: theme('transitionDelay'),
				}
			);
		}),
		require('@tailwindcss/forms'),
	],
};

module.exports = config;
