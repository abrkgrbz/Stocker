import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts'),
        },
      },
    },
    resolve: {
      alias: {
        '@main': resolve(__dirname, 'src/main'),
        '@shared': resolve(__dirname, 'src/shared'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts'),
        },
      },
    },
  },
  renderer: {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer'),
        '@components': resolve(__dirname, 'src/renderer/components'),
        '@features': resolve(__dirname, 'src/renderer/features'),
        '@hooks': resolve(__dirname, 'src/renderer/hooks'),
        '@lib': resolve(__dirname, 'src/renderer/lib'),
        '@providers': resolve(__dirname, 'src/renderer/providers'),
        '@styles': resolve(__dirname, 'src/renderer/styles'),
        '@types': resolve(__dirname, 'src/renderer/types'),
      },
    },
    css: {
      postcss: {
        plugins: [],
      },
    },
  },
});
