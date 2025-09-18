import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import env from './config/env'
import { validateEnv } from './config/env'

import logger from './utils/logger'


if (!validateEnv()) {
  logger.error('Environment validation failed', undefined, 'Main');
}

// Log app initialization
logger.info(`${env.app.name} v${env.app.version} starting in ${env.app.env} mode`, undefined, 'Main');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
