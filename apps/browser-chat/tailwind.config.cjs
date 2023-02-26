/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      width: {
        "button-small": "15rem",
        "button-medium": "20rem",
        "button-large": "25rem"
      },
      gap: {
        "small": "2rem",
        "medium": "4rem",
        "large": "6rem",
      }
    },
  },
  plugins: [],
};
