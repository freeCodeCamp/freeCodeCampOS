import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  envDir: "../",
  plugins: [react()],
  // server: {
  //   cors: {
  //     origin: "http://localhost:8080",
  //   },
  // },
});
