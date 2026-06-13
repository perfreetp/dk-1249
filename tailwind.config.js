/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF8C42',
          light: '#FFB085',
          dark: '#E67330',
        },
        secondary: {
          DEFAULT: '#52B788',
          light: '#7DD3A8',
          dark: '#3D9569',
        },
        accent: {
          DEFAULT: '#4D96FF',
          light: '#7FB3FF',
          dark: '#2F7AE5',
        },
        background: '#FFF8F0',
        text: {
          primary: '#2D3436',
          secondary: '#636E72',
        },
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};
