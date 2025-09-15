import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
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
        target: process.env.VITE_API_URL || 'http://localhost:5000',
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
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Optimize chunk splitting
        manualChunks: (id) => {
          // Core vendor chunk - MUST include React and ReactDOM together
          if (id.includes('node_modules')) {
            // React ecosystem AND Ant Design icons must stay together to avoid context issues
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || 
                id.includes('scheduler') || id.includes('@ant-design/icons')) {
              return 'react-vendor';
            }
            // Ant Design main library in separate chunk
            if (id.includes('antd') || (id.includes('@ant-design') && !id.includes('@ant-design/icons'))) {
              return 'antd-vendor';
            }
            // Charts chunk
            if (id.includes('charts') || id.includes('recharts') || id.includes('apexcharts')) {
              return 'charts-vendor';
            }
            // Utils chunk
            if (id.includes('axios') || id.includes('dayjs') || id.includes('lodash')) {
              return 'utils-vendor';
            }
            // State management chunk
            if (id.includes('zustand') || id.includes('@tanstack')) {
              return 'state-vendor';
            }
            // Forms chunk
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'forms-vendor';
            }
            // Other vendors
            return 'vendor';
          }
        },
        // Optimize asset naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name].[hash].js`;
        },
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
      },
    },
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