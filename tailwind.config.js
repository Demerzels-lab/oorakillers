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
				primary: {
					50: '#FFF1F2',
					500: '#DC2626',
					700: '#B91C1C',
					900: '#7F1D1D',
				},
				dark: {
					50: 'rgba(255, 255, 255, 0.95)',
					200: 'rgba(255, 255, 255, 0.7)',
					400: 'rgba(255, 255, 255, 0.4)',
					600: '#1F2937',
					800: '#111827',
					900: '#0A0E1A',
				},
				glass: {
					surface: 'rgba(30, 41, 59, 0.5)',
					border: 'rgba(255, 255, 255, 0.1)',
					highlight: 'rgba(255, 255, 255, 0.05)',
				},
			},
			fontFamily: {
				display: ['Orbitron', 'sans-serif'],
				body: ['Inter', 'system-ui', 'sans-serif'],
			},
			borderRadius: {
				sm: '8px',
				md: '12px',
				lg: '16px',
				xl: '24px',
			},
			backdropBlur: {
				sm: '12px',
				md: '20px',
				lg: '32px',
				xl: '48px',
			},
			boxShadow: {
				'glass-sm': '0 2px 8px rgba(220, 38, 38, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
				'glass-card': '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
				'glass-card-hover': '0 8px 40px rgba(220, 38, 38, 0.25), 0 4px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(220, 38, 38, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
			},
			keyframes: {
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
			},
			animation: {
				shimmer: 'shimmer 1.5s infinite',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
