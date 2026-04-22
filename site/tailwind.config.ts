import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Helvetica Neue', 'sans-serif'],
  			mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 4px)',
  			sm: 'calc(var(--radius) - 8px)',
  			xl: 'calc(var(--radius) + 4px)',
  			'2xl': 'calc(var(--radius) + 8px)',
  		},
  		boxShadow: {
  			'apple-sm': '0 1px 2px rgba(0,0,0,0.04)',
  			'apple': '0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
  			'apple-lg': '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
  			'apple-xl': '0 24px 80px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08)',
  		},
  		transitionTimingFunction: {
  			'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  			'apple-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  		},
  		transitionDuration: {
  			'250': '250ms',
  			'350': '350ms',
  		},
  		spacing: {
  			'18': '4.5rem',
  			'22': '5.5rem',
  		},
  		colors: {
  			// Muted/pastel semantic colors
  			success: {
  				50: 'hsl(160 25% 96%)',
  				100: 'hsl(160 25% 90%)',
  				200: 'hsl(160 20% 80%)',
  				600: 'hsl(160 25% 45%)',
  				800: 'hsl(160 20% 30%)',
  				900: 'hsl(160 20% 15%)',
  				950: 'hsl(160 20% 10%)',
  			},
  			warning: {
  				50: 'hsl(40 30% 96%)',
  				100: 'hsl(40 30% 88%)',
  				200: 'hsl(40 25% 78%)',
  				600: 'hsl(40 30% 50%)',
  				800: 'hsl(40 25% 35%)',
  				900: 'hsl(40 20% 18%)',
  				950: 'hsl(40 20% 12%)',
  			},
  			danger: {
  				50: 'hsl(0 30% 96%)',
  				100: 'hsl(0 30% 90%)',
  				200: 'hsl(0 25% 80%)',
  				600: 'hsl(0 30% 50%)',
  				800: 'hsl(0 25% 35%)',
  				900: 'hsl(0 20% 18%)',
  				950: 'hsl(0 20% 12%)',
  			},
  			info: {
  				50: 'hsl(220 30% 96%)',
  				100: 'hsl(220 30% 90%)',
  				200: 'hsl(220 25% 80%)',
  				600: 'hsl(220 30% 55%)',
  				800: 'hsl(220 25% 35%)',
  				900: 'hsl(220 20% 18%)',
  				950: 'hsl(220 20% 12%)',
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
