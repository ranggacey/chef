/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Palette - Culinary Warmth
        primary: {
          50: '#F5F3FF',   // Lightest purple
          100: '#EDE9FE',  // Very light purple
          200: '#DDD6FE',  // Light purple
          300: '#C4B5FD',  // Purple
          400: '#A78BFA',  // Medium purple
          500: '#8B5CF6',  // Main purple
          600: '#7C3AED',  // Dark purple
          700: '#6D28D9',  // Darker purple
          800: '#5B21B6',  // Very dark purple
          900: '#4C1D95',  // Deepest purple
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Secondary Palette - Fresh Herbs
        secondary: {
          50: '#ECFDF5',   // Lightest green
          100: '#D1FAE5',  // Very light green
          200: '#A7F3D0',  // Light green
          300: '#6EE7B7',  // Green
          400: '#34D399',  // Medium green
          500: '#10B981',  // Main green
          600: '#059669',  // Dark green
          700: '#047857',  // Darker green
          800: '#065F46',  // Very dark green
          900: '#064E3B',  // Deepest green
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // Accent Palette - Spice Gold
        accent: {
          50: '#FFFBEB',   // Lightest gold
          100: '#FEF3C7',  // Very light gold
          200: '#FDE68A',  // Light gold
          300: '#FCD34D',  // Gold
          400: '#FBBF24',  // Medium gold
          500: '#F59E0B',  // Main gold
          600: '#D97706',  // Dark gold
          700: '#B45309',  // Darker gold
          800: '#92400E',  // Very dark gold
          900: '#78350F',  // Deepest gold
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // Neutral Palette - Kitchen Stone
        neutral: {
          50: '#FAFAFA',   // Lightest gray
          100: '#F5F5F5',  // Very light gray
          200: '#E5E5E5',  // Light gray
          300: '#D4D4D4',  // Gray
          400: '#A3A3A3',  // Medium gray
          500: '#737373',  // Main gray
          600: '#525252',  // Dark gray
          700: '#404040',  // Darker gray
          800: '#262626',  // Very dark gray
          900: '#171717',  // Deepest gray
          950: '#0A0A0A',  // Almost black
        },
        // Status Colors
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Times New Roman', 'Times', 'serif']
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
        'glow-sm': '0 0 10px rgba(139, 92, 246, 0.3)',
        'glow-md': '0 0 20px rgba(139, 92, 246, 0.4)',
        'glow-lg': '0 0 30px rgba(139, 92, 246, 0.5)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-soft': 'pulseSoft 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
    },
  },
  plugins: [],
}