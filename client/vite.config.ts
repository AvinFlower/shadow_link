import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import path from "path";

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const getCartographerPlugin = async () => {
    if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
      const { cartographer } = await import("@replit/vite-plugin-cartographer");
      return cartographer();
    }
    return null;
  };

  const cartographerPlugin = await getCartographerPlugin();

  return {
    server: {
      host: "0.0.0.0",
      port: 3000,
    },
    plugins: [
      react(),
      runtimeErrorOverlay(),
      themePlugin(),
      cartographerPlugin,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@shared": path.resolve(__dirname, "..", "shared"),
        "@assets": path.resolve(__dirname, "..", "attached_assets"),
      },
    },
    build: {
      outDir: path.resolve(__dirname, "..", "dist/public"),
      emptyOutDir: true,
    },
  };
});
