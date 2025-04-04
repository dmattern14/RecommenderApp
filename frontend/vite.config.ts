import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // Add React plugin

  server: {
    proxy: {
      "/api": {
        target:
          "http://09d9f527-9111-461a-827e-c43241612b1b.eastus2.azurecontainer.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
