/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ensures App.tsx and other source files are scanned
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // You can extend Tailwind's default theme here if needed.
      // For example, if your App.tsx uses a specific font not in Tailwind's defaults:
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Matches the example in your App.tsx and index.css
      },
      // Add custom animation for logo
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.9) rotate(-10deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0)' },
        },
      },
      // Basic setup for @tailwindcss/typography if you use 'prose' classes
      // for markdown rendering. Customize as needed.
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.slate.700'),
            h1: {
              color: theme('colors.slate.800'),
              // Add more heading styles if needed
            },
            h2: {
              color: theme('colors.slate.800'),
            },
            h3: {
              color: theme('colors.slate.700'),
            },
            // Add styles for other markdown elements like links, lists, blockquotes etc.
            // Example for links:
            a: {
              color: theme('colors.sky.600'),
              '&:hover': {
                color: theme('colors.sky.700'),
              },
            },
            strong: {
              color: theme('colors.slate.800'),
            },
            // You might want to style lists, code blocks, etc.
          },
        },
        dark: {
          css: {
            color: theme('colors.slate.300'),
            h1: {
              color: theme('colors.slate.200'),
            },
            h2: {
              color: theme('colors.slate.200'),
            },
            h3: {
              color: theme('colors.slate.300'),
            },
            a: {
              color: theme('colors.sky.400'),
              '&:hover': {
                color: theme('colors.sky.300'),
              },
            },
            strong: {
              color: theme('colors.slate.200'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // For styling HTML generated from Markdown
  ],
}