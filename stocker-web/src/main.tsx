import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './polyfills' // Load polyfills first
import './index.css'
import './i18n/config' // Initialize i18n
import 'sweetalert2/dist/sweetalert2.min.css'
import './shared/styles/sweetalert.css'
import App from './App.tsx'
import env from './config/env'
import logger from './utils/logger'

// Validate environment variables
import { validateEnv } from './config/env'

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
