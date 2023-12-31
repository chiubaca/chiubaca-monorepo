/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./libs/chiubaca-ui/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
  daisyui: {
    themes: ["light", "night"],
  },
};
