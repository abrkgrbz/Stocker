import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Production config with fix for module initialization issues
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
  build: {
    target: 'es2015',
    minify: false, // Disable minification temporarily to debug
    rollupOptions: {
      output: {
        // Force everything into a single vendor chunk
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            'antd',
            '@ant-design/icons',
            '@ant-design/colors',
            '@ant-design/cssinjs',
            'dayjs',
            'zustand',
            'axios',
            '@tanstack/react-query',
            'i18next',
            'react-i18next'
          ]
        },
        // Ensure proper module format
        format: 'es',
        // Prevent code splitting for entry
        inlineDynamicImports: false,
      },
    },
    // Disable source maps
    sourcemap: false,
    // Increase chunk size limit
    chunkSizeWarningLimit: 5000,
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