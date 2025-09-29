import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

function spaFallback() {
  return {
    name: "spa-fallback",
    apply: "build",
    generateBundle(_, bundle) {
      if (bundle["404.html"] === undefined && bundle["index.html"]) {
        bundle["404.html"] = { ...bundle["index.html"], fileName: "404.html" };
      }
    },
  };
}

export default defineConfig({
  base: "./", // <-- Corrigido para Netlify
  plugins: [react(), spaFallback()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
