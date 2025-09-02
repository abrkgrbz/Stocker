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
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    dedupe: ['react', 'react-dom'],
  },
  build: {
    // Optimize bundle size
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    } as any,
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Node modules chunks
          if (id.includes('node_modules')) {
            // React ecosystem - Bundle React, React-DOM and JSX runtime together
            if (id.includes('react/jsx') || id.includes('react-dom') || id.includes('react') && !id.includes('react-router') && !id.includes('react-i18next') && !id.includes('react-select')) {
              return 'react-vendor';
            }
            // React Router separately
            if (id.includes('react-router')) {
              return 'react-router-vendor';
            }
            // Ant Design
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'antd-vendor';
            }
            // Chart libraries
            if (id.includes('recharts') || id.includes('d3') || id.includes('victory')) {
              return 'charts-vendor';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'forms-vendor';
            }
            // SignalR
            if (id.includes('@microsoft/signalr')) {
              return 'signalr-vendor';
            }
            // Utilities
            if (id.includes('dayjs') || id.includes('axios') || id.includes('zustand') || id.includes('lodash')) {
              return 'utils-vendor';
            }
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor';
            }
            // Other large libraries
            if (id.includes('sweetalert2')) {
              return 'sweetalert-vendor';
            }
            // Default vendor chunk for other node_modules
            return 'vendor';
          }
        },
        // Better chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/js/${facadeModuleId}-[hash].js`;
        },
      },
      onwarn(warning, warn) {
        // Skip certain warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        warn(warning)
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 500, // 500KB - daha agresif uyarı
    // Source maps for production (optional, can be disabled for security)
    sourcemap: false,
    // Assets inlining threshold
    assetsInlineLimit: 4096, // 4kb
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
