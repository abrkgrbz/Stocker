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
    // Chunk splitting for better caching - simplified for stability
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep React ecosystem together to prevent context issues
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Ant Design components
          'antd': ['antd', '@ant-design/icons', '@ant-design/pro-components'],
          // Charts and visualization
          'charts': ['@ant-design/charts', '@ant-design/plots', 'recharts'],
          // Utilities
          'utils': ['axios', 'dayjs', 'zustand', '@tanstack/react-query'],
          // Other heavy libraries
          'libs': ['@microsoft/signalr', 'i18next', 'react-i18next', 'sweetalert2']
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
