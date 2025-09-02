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
        manualChunks: {
          // Core vendor bundle - React MUST be in a single chunk
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            'react/jsx-runtime'
          ],
          // Ant Design core (without icons)
          'antd-core': ['antd'],
          // Ant Design icons in separate chunk
          'antd-icons': ['@ant-design/icons'],
          // Other large libraries
          charts: ['recharts'],
          utils: ['lodash', 'axios', 'dayjs'],
          'state-management': ['zustand'],
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
