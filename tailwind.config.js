/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      boxShadow: {
        'glow-yellow': '0 0 10px rgba(252, 211, 77, 0.7)',
        'glow-blue': '0 0 10px rgba(96, 165, 250, 0.7)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            strong: {
              fontWeight: 'var(--bold-weight)',
              color: 'var(--bold-color)',
            },
            b: {
              fontWeight: 'var(--bold-weight)',
              color: 'var(--bold-color)',
            }
          },
        },
        // Add specific dark mode overrides
        dark: {
          css: {
            strong: {
              color: 'var(--bold-color)',
            },
            b: {
              color: 'var(--bold-color)',
            }
          }
        }
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}