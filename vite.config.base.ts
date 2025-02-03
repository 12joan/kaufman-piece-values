import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { ManifestV3Export } from '@crxjs/vite-plugin';
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, BuildOptions } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths'
import manifest from './manifest.json';

const isDev = process.env.__DEV__ === 'true';

export const baseManifest: ManifestV3Export = manifest;

export const baseBuildOptions: BuildOptions = {
  sourcemap: isDev,
  emptyOutDir: !isDev
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    react(),
  ],
  publicDir: resolve(__dirname, 'public'),
});
