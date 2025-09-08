import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/main/index.ts"),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/preload/index.ts"),
        },
      },
    },
  },
  renderer: {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/renderer/editor/index.html"),
          gameLoad: resolve(__dirname, "src/renderer/game/index.html"),
        },
        output: [{
          dir: "out/renderer",
          format: "esm",
          entryFileNames: "[name].js",
          sourcemap: false,
          preserveModules: true,
        }],
        preserveEntrySignatures: "allow-extension"
      },
    },
  },
});
