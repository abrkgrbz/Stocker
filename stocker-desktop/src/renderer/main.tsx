/**
 * React Application Entry Point
 *
 * Migrated from stocker-nextjs - this is the renderer process entry
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { theme } from './theme';
import { App } from './App';
import './styles/globals.css';

// Render the application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
