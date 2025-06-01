import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  plugins: [],
  test: {
    globals: true,
    exclude: ["tests", "node_modules", "build", "dist-electron", "public"],
  },
});
