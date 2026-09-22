/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cyber: {
                    bg: '#0A0D14',
                    surface: '#101624',
                    border: 'rgba(59, 130, 246, 0.2)',
                    neonBlue: '#00F0FF',
                    neonPurple: '#8A2BE2',
                    critical: '#FF0055',
                }
            },
            boxShadow: {
                'neon-blue': '0 0 20px rgba(0, 240, 255, 0.35)',
                'neon-purple': '0 0 20px rgba(138, 43, 226, 0.35)',
                'neon-red': '0 0 20px rgba(255, 0, 85, 0.4)',
            }
        },
    },
    plugins: [],
}