import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// usamos path relativo; Vite resolverá a partir do diretório do projeto

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/frontend/",
  build: {
    outDir: "../backend/public/frontend",
    emptyOutDir: true,
  },
});
