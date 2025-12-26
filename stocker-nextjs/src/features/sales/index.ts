// =====================================
// SALES MODULE - BARREL EXPORT
// Feature-Based Architecture
// =====================================

// Types
export * from './types';

// Services
export * from './services';

// Hooks
export * from './hooks';

// Components
export * from './components';

// Re-export individual services for convenience
export {
  orderService,
  quotationService,
  discountService,
  commissionService,
  returnService,
  contractService,
  territoryService,
  shipmentService,
  advancePaymentService,
  creditNoteService,
  serviceOrderService,
  warrantyService,
  segmentService,
  targetService,
} from './services';

// Re-export query keys for convenience
export { salesKeys } from './hooks';
