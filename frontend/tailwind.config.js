/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#641C19',      // Deep rich maroon
          'primary-dark': '#481210',
          'primary-light': '#842622',
          secondary: '#351B14',    // Dark spiced brown
          'secondary-dark': '#24110C',
          gold: '#C49A48',         // Elegant warm gold accent
          'gold-light': '#DFBC72',
          'gold-dark': '#9A7428',
          cream: '#FAF5EB',        // Warm ivory background
          card: '#FFFDF8',         // Card background
          text: '#29221D',         // Primary dark text
          muted: '#81776C',        // Secondary muted text
          border: '#E8DEC8',       // Warm subtle border
          success: '#357A52',      // Fresh green success
          surface: '#F4ECE0',      // Soft tinted container
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        price: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card-hover': '0 14px 30px -10px rgba(53, 27, 20, 0.12), 0 4px 10px -4px rgba(53, 27, 20, 0.06)',
        'premium': '0 20px 40px -15px rgba(100, 28, 25, 0.15)',
        'gold-glow': '0 0 15px rgba(196, 154, 72, 0.25)',
      }
    },
  },
  plugins: [],
}
