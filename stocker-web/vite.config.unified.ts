import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Unified vendor bundle to fix module initialization
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    __DEV__: JSON.stringify(false)
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
  esbuild: {
    // Keep JSX runtime imports
    jsx: 'automatic',
    // Don't drop console and debugger in production for debugging
    drop: [],
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    // Keep console logs for debugging
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
      },
    },
    rollupOptions: {
      output: {
        // Single vendor chunk for ALL dependencies
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Ensure modules are properly formatted
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]',
      },
      // Treat React as external and then include it properly
      external: [],
    },
    modulePreload: {
      polyfill: false,
    },
    sourcemap: false,
    chunkSizeWarningLimit: 10000,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react/jsx-runtime',
      'react-router-dom',
      'antd',
      '@ant-design/icons',
      'dayjs',
      'zustand',
      'axios',
    ],
    esbuildOptions: {
      target: 'es2015',
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