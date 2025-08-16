import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
// Declare `process` para evitar dependência de tipos do Node (@types/node)
declare const process: any;
// usamos path relativo; Vite resolverá a partir do diretório do projeto

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendHost = env.VITE_BACKEND_HOST || "http://localhost:8080";

  return {
    plugins: [react()],
    base: "/frontend/",
    server: {
      port: Number(env.VITE_DEV_PORT || 5173),
      host: true,
      proxy: {
        "/api": {
          target: backendHost,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: "../backend/public/frontend",
      emptyOutDir: true,
    },
  };
});
