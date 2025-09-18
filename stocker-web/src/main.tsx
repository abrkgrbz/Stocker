import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import env from './config/env'
import { validateEnv } from './config/env'

import logger from './utils/logger'

// Debug: Log React and ReactDOM versions
console.log('=== DEBUG: React Module Check ===');
console.log('React:', typeof React !== 'undefined' ? 'Loaded' : 'Not loaded');
console.log('React.version:', (window as any).React?.version);
console.log('React.Children:', (window as any).React?.Children);
console.log('ReactDOM:', typeof ReactDOM !== 'undefined' ? 'Loaded' : 'Not loaded');
console.log('Window.React:', (window as any).React);
console.log('================================');

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('=== GLOBAL ERROR ===');
  console.error('Message:', event.message);
  console.error('Source:', event.filename);
  console.error('Line:', event.lineno);
  console.error('Column:', event.colno);
  console.error('Error object:', event.error);
  console.error('Stack:', event.error?.stack);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('=== UNHANDLED REJECTION ===');
  console.error('Reason:', event.reason);
});

if (!validateEnv()) {
  logger.error('Environment validation failed', undefined, 'Main');
}

// Log app initialization
logger.info(`${env.app.name} v${env.app.version} starting in ${env.app.env} mode`, undefined, 'Main');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error('=== RENDER ERROR ===');
  console.error('Failed to render app:', error);
  console.error('Stack:', (error as Error).stack);
  // Show error in DOM
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h1>Application Failed to Load</h1>
      <pre>${(error as Error).message}</pre>
      <pre>${(error as Error).stack}</pre>
    </div>
  `;
}
