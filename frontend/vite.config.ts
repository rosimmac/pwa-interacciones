import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "PWA Interacciones",
        short_name: "Interacciones",
        description:
          "Registra interacciones comerciales en menos de 10 segundos",
        theme_color: "#6366f1",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "Icono192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icono512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "iconoDefinitivo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    hmr: false,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    // jsdom simula el DOM del navegador en Node.js, necesario para renderizar
    // componentes React y manipular elementos HTML en los tests.
    environment: "jsdom",

    // Se ejecuta antes de cada suite de tests para registrar los matchers de
    // jest-dom y configurar el cleanup automático de React Testing Library.
    setupFiles: ["./src/test/setup.ts"],

    // Resetea el historial de llamadas, instancias y resultados de todos los
    // vi.fn() entre tests sin eliminar la implementación del mock.
    // Equivale a llamar vi.clearAllMocks() en un beforeEach global.
    clearMocks: true,
  },
});
