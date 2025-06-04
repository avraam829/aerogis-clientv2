import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import electron from "vite-plugin-electron";

export default defineConfig({
  plugins: [
    react(),
    electron({
      entry: "electron/main.js", // Главный файл Electron
    }),
  ],
  build: {
    outDir: "dist", // Куда Vite будет складывать файлы
  },
});
