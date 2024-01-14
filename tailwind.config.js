const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./libs/chiubaca-ui/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", ...defaultTheme.fontFamily.sans],
        mono: ["IBM Plex Mono", ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          secondary: "blue",
          info: "rgb(12 175 233)",
        },
      },

      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          secondary: "blue",
          info: "rgb(12 175 233)",
        },
      },
    ],
    darkTheme: "dark",
    logs: true,
  },
};
