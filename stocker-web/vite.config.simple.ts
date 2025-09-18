import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Simplified production config to fix module loading issues
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
    minify: 'esbuild', // Use esbuild for faster builds
    rollupOptions: {
      output: {
        // Put ALL React-dependent libraries in a single chunk to fix loading order
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Include ALL React ecosystem and UI libraries together
            if (id.includes('react') || 
                id.includes('scheduler') ||
                id.includes('@emotion') ||
                id.includes('@mui') ||
                id.includes('antd') || 
                id.includes('@ant-design') ||
                id.includes('@rc-component') ||
                id.includes('rc-')) {
              return 'vendor-react';
            }
            
            // Everything else
            return 'vendor';
          }
        },
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]',
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
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