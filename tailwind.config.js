/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./libs/chiubaca-ui/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./apps/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
