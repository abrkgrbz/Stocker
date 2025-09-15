import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/tr'
import './index.css'
import './styles/sweetalert.css'
import App from './App.tsx'
import { enableMockAuth } from './services/mockAuth'
import { initializeSecurity } from './utils/security'
import { sentryService } from './services/sentryService'

// Configure dayjs
dayjs.extend(relativeTime)
dayjs.locale('tr')

// Initialize Sentry monitoring
sentryService.initialize({
  environment: import.meta.env.MODE,
  debug: import.meta.env.DEV,
  enabled: import.meta.env.VITE_SENTRY_DSN ? true : false
});

// Initialize security measures
initializeSecurity(import.meta.env.DEV);

// Enable mock auth based on environment variable
const shouldEnableMockAuth = import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true';
if (shouldEnableMockAuth) {
  enableMockAuth(true);
  console.log('🔐 Mock Auth Enabled - Use these credentials:');
  console.log('Super Admin: admin@stocker.com / Admin123!');
  console.log('Admin: user@stocker.com / User123!');
} else {
  console.log('🔐 Using Real API:', import.meta.env.VITE_API_URL);
}

if (!import.meta.env.VITE_SENTRY_DSN && import.meta.env.DEV) {
  console.log('⚠️ Sentry DSN not configured. Add VITE_SENTRY_DSN to .env for monitoring.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
