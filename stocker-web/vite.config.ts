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
      },
    },
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Node modules chunking strategy
          if (id.includes('node_modules')) {
            // React ecosystem - must stay together
            if (id.includes('react-dom') || id.includes('react/') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Ant Design and charts
            if (id.includes('antd') || id.includes('@ant-design/icons')) {
              return 'antd-vendor';
            }
            if (id.includes('@ant-design/pro-components')) {
              return 'antd-pro';
            }
            if (id.includes('@ant-design/charts') || id.includes('@ant-design/plots')) {
              return 'charts';
            }
            // Form and query handling
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            // SignalR
            if (id.includes('@microsoft/signalr')) {
              return 'signalr';
            }
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n';
            }
            // Utilities
            if (id.includes('dayjs') || id.includes('axios') || id.includes('zustand')) {
              return 'utils';
            }
            // Other large libraries
            if (id.includes('sweetalert2')) {
              return 'sweetalert';
            }
            if (id.includes('recharts')) {
              return 'recharts';
            }
            // Everything else from node_modules
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
    chunkSizeWarningLimit: 600, // 600KB warning threshold
    // Source maps for production debugging
    sourcemap: true,
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
