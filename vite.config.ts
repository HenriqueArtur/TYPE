import { resolve } from "node:path";
import { globSync } from "node:fs";
import { defineConfig } from "vite";
import { copyFileSync, mkdirSync, statSync } from "node:fs";
import { dirname, relative } from "node:path";

function createEntries(patterns, baseDir = 'src/__Project__') {
  const entries = {};
  
  patterns.forEach(({ pattern, prefix = '' }) => {
    const files = globSync(pattern);
    
    files.forEach(file => {
      const relativePath = file.replace(baseDir + '/', '');
      const nameWithoutExt = relativePath.replace(/\.[^.]+$/, '');
      const name = prefix ? `${prefix}${nameWithoutExt}` : nameWithoutExt;
      
      entries[name] = resolve(__dirname, file);
    });
  });
  
  return entries;
}

export default defineConfig({
    build: {
    minify: false,
    rollupOptions: {
      input: createEntries([
        { pattern: "src/__Project__/**/*.ts" },
      ]),
      output: [{
        dir: "out/game",
        format: "esm",
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        preserveModules: false,
      }],
      preserveEntrySignatures: "strict",
      plugins: [
        {
          name: "copy-resources",
          closeBundle() {
            const allFiles = globSync("src/__Project__/**/*");
            const resourceFiles = allFiles.filter(file => {
              const stats = statSync(file);
              return stats.isFile() && !file.endsWith('.ts');
            });
            resourceFiles.forEach(file => {
              const relativePath = relative("src/__Project__", file);
              const destPath = resolve("out/game", relativePath);
              
              mkdirSync(dirname(destPath), { recursive: true });
              copyFileSync(file, destPath);
            });
          },
        },
      ],
    },
  }
});
