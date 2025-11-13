import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Ensure assets are loaded from root
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // Sentry plugin for source maps and release tracking
    process.env.VITE_SENTRY_DSN && sentryVitePlugin({
      org: process.env.SENTRY_ORG || 'stocker',
      project: process.env.SENTRY_PROJECT || 'stocker-admin',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
      release: {
        name: process.env.VITE_APP_VERSION || '1.0.0',
        cleanArtifacts: true,
        setCommits: {
          auto: true
        },
      },
      sourcemaps: {
        include: ['./dist'],
        ignore: ['node_modules'],
        urlPrefix: '~/',
      },
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://api.stoocker.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.VITE_SENTRY_DSN ? 'hidden' : false, // Generate sourcemaps for Sentry but hide them
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Let Vite handle chunk splitting automatically
        // This avoids React context and hooks issues in production
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            return `images/[name].[hash][extname]`;
          }
          if (/woff|woff2|eot|ttf|otf/i.test(extType || '')) {
            return `fonts/[name].[hash][extname]`;
          }
          if (extType === 'css') {
            return `css/[name].[hash][extname]`;
          }
          return `assets/[name].[hash][extname]`;
        },
        // Ensure proper module format for ES modules
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
      },
    },
    // Ensure proper MIME types
    assetsInlineLimit: 0, // Don't inline assets to avoid MIME type issues
    // Performance optimizations
    reportCompressedSize: false, // Faster builds
    chunkSizeWarningLimit: 1000, // 1MB warning limit
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      'axios',
      'zustand',
      'dayjs',
    ],
    exclude: ['@microsoft/signalr'], // Exclude large dependencies that are rarely used
  },
})