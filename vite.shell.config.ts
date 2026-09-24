import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const projectRoot = import.meta.dirname;

/** Static build used by the Windows Electron app and the Android APK. */
export default defineConfig({
  root: resolve(projectRoot, "shell"),
  base: "./",
  publicDir: resolve(projectRoot, "public"),
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: { "@": resolve(projectRoot, "src") },
  },
  build: {
    outDir: resolve(projectRoot, "shell/dist"),
    emptyOutDir: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 8090,
    strictPort: true,
  },
});
