/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
        // Default Tailwind breakpoints:
        // sm: '640px',
        // md: '768px',  
        // lg: '1024px',
        // xl: '1280px',
        // 2xl: '1536px'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxHeight: {
        'screen-90': '90vh',
        'screen-80': '80vh',
      },
      minHeight: {
        'screen-90': '90vh',
        'screen-80': '80vh',
      },
    },
  },
  plugins: [],
}