import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Critical chunks (load immediately)
            if (id.includes('react/index') || id.includes('react-dom/index')) {
              return 'react-core';
            }

            // Essential UI components (high priority)
            if (id.includes('antd/es/button') || 
                id.includes('antd/es/input') || 
                id.includes('antd/es/form')) {
              return 'antd-essential';
            }

            // Layout components (high priority)
            if (id.includes('antd/es/layout') || 
                id.includes('antd/es/menu') || 
                id.includes('antd/es/breadcrumb')) {
              return 'antd-layout';
            }

            // Data display (medium priority)
            if (id.includes('antd/es/table') || 
                id.includes('antd/es/list') || 
                id.includes('antd/es/card')) {
              return 'antd-data';
            }

            // Advanced components (low priority - lazy load)
            if (id.includes('antd/es/date-picker') || 
                id.includes('antd/es/select') || 
                id.includes('antd/es/cascader')) {
              return 'antd-advanced';
            }

            // Heavy libraries (definitely lazy load)
            if (id.includes('@monaco-editor')) {
              return 'monaco-editor-lazy';
            }

            if (id.includes('framer-motion')) {
              return 'framer-motion-lazy';
            }

            if (id.includes('@ant-design/pro-components')) {
              return 'pro-components-lazy';
            }

            if (id.includes('react-beautiful-dnd')) {
              return 'dnd-lazy';
            }

            if (id.includes('@ant-design/charts')) {
              return 'charts-lazy';
            }

            if (id.includes('@microsoft/signalr')) {
              return 'signalr-lazy';
            }

            if (id.includes('sweetalert')) {
              return 'sweetalert-lazy';
            }

            if (id.includes('lodash')) {
              return 'lodash-lazy';
            }

            if (id.includes('moment') || id.includes('dayjs')) {
              return 'datetime-lazy';
            }

            if (id.includes('d3-')) {
              return 'd3-lazy';
            }

            // Group utilities
            if (id.includes('axios') || id.includes('qs')) {
              return 'network-utilities';
            }

            if (id.includes('@tanstack/react-query')) {
              return 'query-utilities';
            }

            if (id.includes('zustand') || id.includes('immer')) {
              return 'state-utilities';
            }

            if (id.includes('i18next')) {
              return 'i18n-utilities';
            }

            // Icon libraries
            if (id.includes('@ant-design/icons')) {
              const iconTypes = ['outlined', 'filled', 'twotone'];
              for (const type of iconTypes) {
                if (id.includes(type)) {
                  return `icons-${type}`;
                }
              }
              return 'icons-base';
            }

            // Split remaining vendors by first letter for better caching
            const packageName = id.split('node_modules/')[1]?.split('/')[0];
            if (packageName) {
              // Group small packages together
              const firstChar = packageName.charAt(0);
              if (['a', 'b', 'c'].includes(firstChar)) {
                return 'vendor-abc';
              }
              if (['d', 'e', 'f'].includes(firstChar)) {
                return 'vendor-def';
              }
              if (['g', 'h', 'i', 'j', 'k', 'l'].includes(firstChar)) {
                return 'vendor-ghijkl';
              }
              if (['m', 'n', 'o', 'p'].includes(firstChar)) {
                return 'vendor-mnop';
              }
              if (['q', 'r', 's', 't'].includes(firstChar)) {
                return 'vendor-qrst';
              }
              if (['u', 'v', 'w', 'x', 'y', 'z'].includes(firstChar)) {
                return 'vendor-uvwxyz';
              }
              return 'vendor-other';
            }
          }

          // Application code splitting
          if (id.includes('src/features/')) {
            const feature = id.split('src/features/')[1]?.split('/')[0];
            if (feature) {
              return `feature-${feature}`;
            }
          }

          if (id.includes('src/shared/')) {
            return 'app-shared';
          }

          if (id.includes('src/contexts/')) {
            return 'app-contexts';
          }
        },

        // Optimize chunk names for caching
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          
          // Critical chunks
          if (name === 'react-core' || name === 'antd-essential') {
            return 'critical/[name]-[hash].js';
          }

          // Lazy chunks
          if (name?.includes('-lazy')) {
            return 'lazy/[name]-[hash].js';
          }

          // Feature chunks
          if (name?.includes('feature-')) {
            return 'features/[name]-[hash].js';
          }

          // Utility chunks
          if (name?.includes('-utilities')) {
            return 'utils/[name]-[hash].js';
          }

          // Icon chunks
          if (name?.includes('icons-')) {
            return 'icons/[name]-[hash].js';
          }

          return 'chunks/[name]-[hash].js';
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'antd',
      '@tanstack/react-query'
    ],
    exclude: [
      '@monaco-editor/react',
      'framer-motion',
      '@ant-design/pro-components'
    ]
  }
});