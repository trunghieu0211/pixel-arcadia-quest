
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Neo-Retro arcade theme colors
				arcade: {
					primary: '#FF00FF', // Hot pink
					secondary: '#00FFFF', // Cyan
					tertiary: '#FFFF00', // Yellow
					background: '#0A0A1F', // Dark blue/black
					accent: '#FF5500', // Orange
					text: '#FFFFFF', // White
				},
				neon: {
					pink: '#FF00FF',
					blue: '#00FFFF',
					green: '#00FF00',
					yellow: '#FFFF00',
					purple: '#9900FF',
				},
			},
			fontFamily: {
				pixel: ['"Press Start 2P"', 'cursive'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'neon-pulse': {
					'0%, 100%': { 
						textShadow: '0 0 4px #fff, 0 0 8px #fff, 0 0 12px #0ff, 0 0 16px #0ff, 0 0 20px #0ff' 
					},
					'50%': { 
						textShadow: '0 0 4px #fff, 0 0 6px #fff, 0 0 8px #0ff, 0 0 10px #0ff, 0 0 14px #0ff' 
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'glitch': {
					'0%, 100%': { transform: 'translate(0)' },
					'20%': { transform: 'translate(-5px, 5px)' },
					'40%': { transform: 'translate(-5px, -5px)' },
					'60%': { transform: 'translate(5px, 5px)' },
					'80%': { transform: 'translate(5px, -5px)' }
				},
				'flicker': {
					'0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': {
						filter: 'brightness(1)'
					},
					'20%, 24%, 55%': {
						filter: 'brightness(1.3)'
					}
				},
				'blink': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' }
				},
				'scanline': {
					'0%': { transform: 'translateY(0%)' },
					'100%': { transform: 'translateY(100%)' }
				},
				'marquee': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(-100%)' }
				},
				'pixel-spin': {
					'0%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(90deg)' },
					'50%': { transform: 'rotate(180deg)' },
					'75%': { transform: 'rotate(270deg)' },
					'100%': { transform: 'rotate(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'neon-pulse': 'neon-pulse 2s infinite',
				'float': 'float 4s ease-in-out infinite',
				'glitch': 'glitch 0.5s ease infinite',
				'flicker': 'flicker 2s linear infinite',
				'blink': 'blink 1s step-start infinite',
				'scanline': 'scanline 8s linear infinite',
				'marquee': 'marquee 15s linear infinite',
				'pixel-spin': 'pixel-spin 1.5s steps(4) infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
