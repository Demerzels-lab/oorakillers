/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				// OORA Red / Alert Theme
				primary: {
					50: '#FFF1F2',
					500: '#DC2626', // Main Alert Red
					700: '#B91C1C',
					900: '#7F1D1D',
				},
				// Sci-Fi / Terminal Colors
				terminal: {
					green: '#00FF00', // CRT Green
					black: '#0a0a0a', // Deep background
					frame: '#1a1a1a', // UI Borders
				},
				dark: {
					50: 'rgba(255, 255, 255, 0.95)',
					200: 'rgba(255, 255, 255, 0.7)',
					400: 'rgba(255, 255, 255, 0.4)',
					600: '#1F2937',
					800: '#111827',
					900: '#050505', // Darker base for OORA theme
				},
				glass: {
					surface: 'rgba(10, 10, 10, 0.8)', // Darker glass
					border: 'rgba(255, 255, 255, 0.1)',
					highlight: 'rgba(255, 255, 255, 0.05)',
				},
			},
			fontFamily: {
				display: ['Orbitron', 'sans-serif'], // Headers
				body: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['Courier Prime', 'Courier New', 'monospace'], // Data/Stats
			},
			backgroundImage: {
				'grid-pattern': "radial-gradient(#333 1px, transparent 1px)",
			},
			borderRadius: {
				sm: '4px', // Sharper corners for tech look
				md: '8px',
				lg: '12px',
				xl: '20px',
			},
			keyframes: {
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				// Add blink for "WARNING" text
				blink: {
					'0%, 100%': { opacity: 1 },
					'50%': { opacity: 0 },
				}
			},
			animation: {
				shimmer: 'shimmer 1.5s infinite',
				blink: 'blink 1s step-end infinite',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}