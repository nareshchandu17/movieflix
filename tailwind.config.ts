import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'app-gradient': 'linear-gradient(to bottom right, #000000, #1f2937, #000000)',
  			'app-gradient-dark': 'linear-gradient(to bottom right, #000000, #111827, #000000)'
  		},
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
  			'bg-black': '#0E0E0E',
  			'theme-primary': '#EF4444',
  			'light-primary': '#F87171',
  			white: '#ffffff',
  			grey: '#1D1B1B',
  			'light-white': '#6D6B6B',
  			navbg: 'rgb(8, 8, 8)',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
        cyan: {
          DEFAULT: '#29D7FF',
          50: '#E6FAFF',
          100: '#C7F3FF',
          200: '#8AE7FF',
          300: '#4DDBFF',
          400: '#29D7FF',
          500: '#00B8E6',
          600: '#0092B8',
          700: '#006C8A',
          800: '#00465C',
          900: '#00202E',
          glow: 'rgba(41, 215, 255, 0.3)'
        },
        magenta: {
          DEFAULT: '#FF2BD6',
          50: '#FFE6F9',
          100: '#FFC7F2',
          200: '#FF8AE5',
          300: '#FF4DD8',
          400: '#FF2BD6',
          500: '#E600B8',
          600: '#B80093',
          700: '#8A006E',
          800: '#5C0049',
          900: '#2E0024',
        },
        lime: {
          DEFAULT: '#C7FF3D',
          50: '#F5FFE6',
          100: '#EBFFC7',
          200: '#D7FF8A',
          300: '#C3FF4D',
          400: '#C7FF3D',
          500: '#B3E600',
          600: '#8FB800',
          700: '#6B8A00',
          800: '#475C00',
          900: '#232E00',
          glow: 'rgba(199, 255, 61, 0.3)'
        },
        violet: {
          DEFAULT: '#7B4DFF',
          50: '#F0EBFF',
          100: '#E0D4FF',
          200: '#C2A9FF',
          300: '#A37EFF',
          400: '#7B4DFF',
          500: '#5C1AFF',
          600: '#4A00E6',
          700: '#3800B8',
          800: '#26008A',
          900: '#14005C',
          glow: 'rgba(123, 77, 255, 0.3)'
        },
        dark: {
          DEFAULT: '#07070A',
          50: '#1A1A24',
          100: '#0E1016',
          200: '#07070A',
          300: '#050508',
          400: '#030305',
          500: '#020203',
        },
  		},
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
        xl: "calc(var(--radius) + 4px)",
        xs: "calc(var(--radius) - 6px)",
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
  		},
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        glow: '0 0 20px rgba(41, 215, 255, 0.3)',
        'glow-lg': '0 0 40px rgba(41, 215, 255, 0.4)',
        'glow-magenta': '0 0 20px rgba(255, 43, 214, 0.3)',
        'glow-lime': '0 0 20px rgba(199, 255, 61, 0.3)',
        'glow-violet': '0 0 20px rgba(123, 77, 255, 0.3)',
      },
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
  		}
  	},
  plugins: [tailwindcssAnimate],
  },
};

export default config;
