require("dotenv").config();

window.addEventListener("DOMContentLoaded", () => {
  window.VITE_GTM_ID = process.env.VITE_GTM_ID;
});
