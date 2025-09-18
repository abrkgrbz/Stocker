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
        drop_console: false,  // Temporarily keep console logs for debugging
        drop_debugger: false, // Keep debugger statements
        pure_funcs: [], // Don't remove any functions
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
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Critical React core (must load first) ~150KB
            if (id.includes('react/index') || id.includes('react/cjs')) {
              return 'react-core';
            }
            if (id.includes('react-dom/index') || id.includes('react-dom/cjs')) {
              return 'react-dom';
            }
            
            // Split Ant Design into many small chunks
            if (id.includes('antd/es/') || id.includes('antd/lib/')) {
              const parts = id.split('/');
              const componentIndex = parts.findIndex(p => p === 'es' || p === 'lib') + 1;
              const component = parts[componentIndex];
              
              // Group by component type
              if (['button', 'input', 'checkbox', 'radio', 'switch'].includes(component)) {
                return 'antd-inputs';
              }
              if (['form', 'select', 'cascader', 'date-picker', 'time-picker'].includes(component)) {
                return 'antd-forms';
              }
              if (['modal', 'drawer', 'message', 'notification', 'popover', 'tooltip'].includes(component)) {
                return 'antd-feedback';
              }
              if (['table', 'list', 'tree', 'tree-select'].includes(component)) {
                return 'antd-data';
              }
              if (['menu', 'dropdown', 'breadcrumb', 'pagination', 'steps'].includes(component)) {
                return 'antd-nav';
              }
              if (['layout', 'grid', 'space', 'divider', 'row', 'col'].includes(component)) {
                return 'antd-layout';
              }
              if (['tabs', 'card', 'collapse', 'carousel'].includes(component)) {
                return 'antd-display';
              }
              // Everything else
              return 'antd-misc';
            }
            
            // Split icons into multiple chunks
            if (id.includes('@ant-design/icons')) {
              if (id.includes('/es/icons/')) {
                const iconName = id.split('/es/icons/')[1];
                // Group common icons
                if (iconName && iconName.match(/^(Close|Check|Plus|Minus|Edit|Delete|Search|Loading)/)) {
                  return 'icons-common';
                }
                if (iconName && iconName.match(/^(User|Team|Mail|Phone|Home|Setting)/)) {
                  return 'icons-user';
                }
                if (iconName && iconName.match(/^(File|Folder|Download|Upload|Cloud|Database)/)) {
                  return 'icons-file';
                }
                return 'icons-other';
              }
              return 'icons-base';
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
            
            // MUI - lazy load
            if (id.includes('@mui/material')) {
              return 'mui-material-lazy';
            }
            if (id.includes('@mui/icons-material')) {
              return 'mui-icons-lazy';
            }
            if (id.includes('@emotion')) {
              return 'emotion-lazy';
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
            
            // Router
            if (id.includes('react-router')) {
              return 'router';
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
    // Enable source maps for debugging
    sourcemap: 'hidden', // Generate source maps but don't reference them in the code
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