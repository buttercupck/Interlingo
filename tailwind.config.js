/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Interlingo Design System Colors
      colors: {
        // Primary Color Palette
        primary: {
          blue: '#1B365C',      // Deep professional blue - trust & reliability
          light: '#2D4A6B',     // Lighter variant for hover states
          lighter: '#EBF1F7',   // Very light blue for backgrounds
        },
        // Secondary Colors
        secondary: {
          teal: '#0D7377',      // Teal for accents - communication/translation
          green: '#14A085',     // Success green - confirmed appointments
          purple: '#6366F1',    // Modern purple for highlights
        },
        // System Colors
        success: '#10B981',     // Success actions - booking confirmed
        warning: '#F59E0B',     // Warning states - pending review
        danger: '#EF4444',      // Error states - failed/cancelled
        info: '#3B82F6',        // Information - general alerts
        // Extended Gray Scale
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      },
      // Typography
      fontFamily: {
        primary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        secondary: ['Poppins', 'sans-serif'],
        mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      },
      fontSize: {
        'xs': '0.75rem',      // 12px
        'sm': '0.875rem',     // 14px
        'base': '1rem',       // 16px
        'lg': '1.125rem',     // 18px
        'xl': '1.25rem',      // 20px
        '2xl': '1.5rem',      // 24px
        '3xl': '1.875rem',    // 30px
        '4xl': '2.25rem',     // 36px
      },
      // Spacing System - 8px grid
      spacing: {
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
      },
      // Border Radius
      borderRadius: {
        'sm': '0.25rem',   // 4px
        'md': '0.375rem',  // 6px
        'lg': '0.5rem',    // 8px
        'xl': '0.75rem',   // 12px
      },
      // Box Shadows
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
