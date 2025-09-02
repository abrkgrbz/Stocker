import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    // Enhanced chunk splitting for better caching and smaller bundles
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // Core React ecosystem - MUST load first
            if (id.includes('react-dom')) {
              return 'react-dom';
            }
            if (id.includes('react') && !id.includes('react-dom') && !id.includes('react-router') && !id.includes('@ant-design')) {
              return 'react';
            }
            if (id.includes('react-router')) {
              return 'react-router';
            }
            
            // Ant Design core
            if (id.includes('antd') && !id.includes('@ant-design/icons') && !id.includes('@ant-design/pro')) {
              return 'antd-core';
            }
            
            // Ant Design icons separate chunk - depends on React
            if (id.includes('@ant-design/icons')) {
              return 'antd-icons';
            }
            
            // Ant Design Pro and extras
            if (id.includes('@ant-design/pro') || id.includes('rc-')) {
              return 'antd-extra';
            }
            
            // Charts and visualization
            if (id.includes('chart') || id.includes('recharts') || id.includes('@ant-design/plots') || id.includes('g2') || id.includes('d3')) {
              return 'charts';
            }
            
            // Animation libraries
            if (id.includes('framer-motion') || id.includes('react-spring')) {
              return 'animations';
            }
            
            // SignalR and real-time
            if (id.includes('signalr')) {
              return 'signalr';
            }
            
            // State management
            if (id.includes('zustand') || id.includes('@tanstack/react-query')) {
              return 'state-management';
            }
            
            // Utilities
            if (id.includes('axios') || id.includes('dayjs') || id.includes('moment') || id.includes('lodash')) {
              return 'utils';
            }
            
            // Virtual scrolling
            if (id.includes('react-window') || id.includes('react-virtualized')) {
              return 'virtual';
            }
            
            // Internationalization
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n';
            }
            
            // Other UI libraries
            if (id.includes('sweetalert') || id.includes('react-hot-toast')) {
              return 'ui-libs';
            }
            
            // Default vendor chunk for remaining
            return 'vendor';
          }
          
          // Application chunks
          if (id.includes('src/features/master')) {
            return 'master';
          }
          
          if (id.includes('src/features/tenant')) {
            return 'tenant';
          }
          
          if (id.includes('src/shared/components')) {
            return 'components';
          }
          
          if (id.includes('src/services')) {
            return 'services';
          }
          
          if (id.includes('src/shared/api')) {
            return 'api';
          }
        },
        // Better chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
      onwarn(warning, warn) {
        // Skip certain warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        if (warning.code === 'CIRCULAR_DEPENDENCY') return
        warn(warning)
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 500, // 500KB warning threshold
    // Source maps for production debugging (disable for smaller builds)
    sourcemap: false,
    // Assets inlining threshold
    assetsInlineLimit: 4096, // 4kb
    // CSS code splitting
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'antd', 
      'dayjs',
      '@ant-design/icons',
      '@ant-design/pro-components',
      'zustand'
    ],
    exclude: ['@tanstack/react-query-devtools'],
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
