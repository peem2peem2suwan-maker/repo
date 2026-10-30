/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          light: '#334155',
        },
        secondary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#3B82F6',
          muted: '#EFF6FF',
        },
        bg: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
          subtle: '#F1F5F9',
        },
        status: {
          available: '#16A34A',
          occupied: '#DC2626',
          reserved: '#F59E0B',
          maintenance: '#475569',
        }
      },
    },
  },
  plugins: [],
};
