// =====================================
// ALERTS MODULE - PUBLIC API
// Central Alert System
// =====================================

// Types
export * from './types';

// Services
export { alertService } from './services/alert.service';

// Hooks
export {
  useAlerts,
  useUnreadAlertCount,
  useMarkAlertAsRead,
  useMarkAllAlertsAsRead,
  useDismissAlert,
  alertKeys,
} from './hooks/useAlerts';

// Components
export { AlertBell } from './components/AlertBell';
export { AlertItem } from './components/AlertItem';
