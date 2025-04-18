import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Функция для условного импорта плагина
const getCartographerPlugin = async () => {
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    return cartographer();
  }
  return null;
};

export default defineConfig(async () => {
  const cartographerPlugin = await getCartographerPlugin();

  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      themePlugin(),
      // Добавляем плагин, если он существует
      cartographerPlugin,
    ].filter(Boolean), // Убираем null/undefined из массива плагинов
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"), // Исправлено на __dirname
        "@shared": path.resolve(__dirname, "shared"), // Исправлено на __dirname
        "@assets": path.resolve(__dirname, "attached_assets"), // Исправлено на __dirname
      },
    },
    root: path.resolve(__dirname, "client"), // Исправлено на __dirname
    build: {
      outDir: path.resolve(__dirname, "dist/public"), // Исправлено на __dirname
      emptyOutDir: true,
    },
  };
});
