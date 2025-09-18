import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    __DEV__: JSON.stringify(true)
  },
  esbuild: {
    charset: 'utf8',
    legalComments: 'none',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/layouts': path.resolve(__dirname, './src/layouts'),
      '@/config': path.resolve(__dirname, './src/config'),
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  build: {
    // Optimize bundle size
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        dead_code: true,
        unused: true,
        passes: 2,
        toplevel: true,
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_proto: true,
        unsafe_regexp: true,
      },
      mangle: {
        safari10: true,
        toplevel: true,
      },
      format: {
        comments: false,
      },
    },
    // Ultra-aggressive chunk splitting for < 2MB total
    rollupOptions: {
      output: {
        // Ensure proper module load order
        inlineDynamicImports: false,
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Keep all React ecosystem together to prevent module loading issues
            if (id.includes('react-dom') || 
                id.includes('react/') || 
                id.includes('react-is') ||
                id.includes('scheduler') ||
                id.includes('react-router')) {
              return 'react-vendor';
            }
            
            // Ant Design and its icons must be in one chunk to prevent loading issues
            if (id.includes('@ant-design/icons') || id.includes('antd')) {
              return 'antd-vendor';
            }
            
            
            // Charts - lazy load these
            if (id.includes('@ant-design/charts') || id.includes('@ant-design/plots')) {
              return 'charts-antd-lazy';
            }
            if (id.includes('@ant-design/pro-components')) {
              const component = id.split('/es/')[1]?.split('/')[0];
              if (['pro-form', 'pro-field'].includes(component)) {
                return 'pro-forms-lazy';
              }
              if (['pro-table', 'pro-list'].includes(component)) {
                return 'pro-data-lazy';
              }
              return 'pro-other-lazy';
            }
            
            // Heavy visualization libraries - definitely lazy load
            if (id.includes('recharts')) {
              if (id.includes('/es6/cartesian') || id.includes('/es6/polar')) {
                return 'recharts-charts-lazy';
              }
              if (id.includes('/es6/component')) {
                return 'recharts-components-lazy';
              }
              return 'recharts-core-lazy';
            }
            if (id.includes('d3')) {
              return 'd3-lazy';
            }
            
            // MUI and Emotion - must be loaded with React
            if (id.includes('@mui/material') || 
                id.includes('@mui/icons-material') || 
                id.includes('@emotion')) {
              return 'mui-vendor';
            }
            
            // Utilities - split by size and usage
            if (id.includes('axios')) {
              return 'network';
            }
            if (id.includes('dayjs')) {
              return 'datetime';
            }
            if (id.includes('date-fns')) {
              return 'date-fns-lazy';
            }
            if (id.includes('lodash')) {
              return 'lodash-lazy';
            }
            
            // State management
            if (id.includes('zustand')) {
              return 'state';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            
            
            // i18n - can be lazy loaded
            if (id.includes('i18next')) {
              return 'i18n-lazy';
            }
            
            // Large optional features
            if (id.includes('monaco-editor')) {
              return 'monaco-lazy';
            }
            if (id.includes('@sentry')) {
              return 'sentry-lazy';
            }
            if (id.includes('@microsoft/signalr')) {
              return 'signalr-lazy';
            }
            if (id.includes('sweetalert2')) {
              return 'sweetalert-lazy';
            }
            if (id.includes('framer-motion')) {
              return 'motion-lazy';
            }
            if (id.includes('react-beautiful-dnd')) {
              return 'dnd-lazy';
            }
            if (id.includes('react-window')) {
              return 'virtual-lazy';
            }
            if (id.includes('emoji-picker')) {
              return 'emoji-lazy';
            }
            if (id.includes('qrcode')) {
              return 'qrcode-lazy';
            }
            if (id.includes('canvas-confetti')) {
              return 'confetti-lazy';
            }
            
            // Small utilities
            if (id.includes('classnames') || id.includes('tslib')) {
              return 'helpers';
            }
            
            // Remaining vendors
            return 'vendor-other';
          }
          
          // Application code - split by feature
          if (id.includes('src/features/master')) {
            return 'app-master';
          }
          if (id.includes('src/features/tenant')) {
            return 'app-tenant';
          }
          if (id.includes('src/features/auth')) {
            return 'app-auth';
          }
          if (id.includes('src/shared')) {
            return 'app-shared';
          }
        },
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name || 'chunk';
          // Lazy chunks get different naming
          if (name.includes('-lazy')) {
            return 'assets/lazy/[name]-[hash].js';
          }
          return 'assets/js/[name]-[hash].js';
        },
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // Optimize entry chunk
        entryFileNames: 'assets/[name]-[hash].js',
      },
      onwarn(warning, warn) {
        // Skip certain warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        if (warning.code === 'CIRCULAR_DEPENDENCY') return
        if (warning.code === 'EVAL') return
        warn(warning)
      }
    },
    // Lower chunk size warning limit
    chunkSizeWarningLimit: 200, // 200KB warning threshold
    // Disable source maps for production
    sourcemap: false,
    // Lower assets inlining threshold
    assetsInlineLimit: 2048, // 2kb
    // Aggressive CSS code splitting
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: true,
    // Use esbuild for minification (faster)
    cssMinify: 'esbuild',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react/jsx-runtime',
      'antd/es/button',
      'antd/es/input',
      'antd/es/form',
      'antd/es/message',
      'antd/es/layout',
      'dayjs',
      'zustand',
      'axios',
      'react-router-dom',
    ],
    exclude: [
      '@tanstack/react-query-devtools',
      '@ant-design/charts',
      '@ant-design/plots',
      'recharts',
      '@mui/material',
      '@mui/icons-material',
      'monaco-editor',
      '@sentry/react',
      '@microsoft/signalr',
    ],
    esbuildOptions: {
      target: 'es2020',
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5104',
        changeOrigin: true,
      },
    },
  },
})