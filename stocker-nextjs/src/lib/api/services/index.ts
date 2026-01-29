export { authService, AuthService } from './auth.service';
export type {
  CheckEmailRequest,
  CheckEmailResponse,
  LoginRequest,
  LoginResponse,
  Verify2FARequest,
  Verify2FAResponse,
  Setup2FAResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ValidateResetTokenRequest,
  ValidateResetTokenResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from './auth.service';

export { customerService, CustomerService } from './customer.service';
export type {
  Customer,
  CustomerListResponse,
  CustomerFilters,
} from './customer.service';

export { securitySettingsService, SecuritySettingsService } from './security-settings.service';
export type {
  SecuritySettingsDto,
  PasswordPolicyDto,
  TwoFactorSettingsDto,
  SessionSettingsDto,
  ApiSecuritySettingsDto,
  UpdatePasswordPolicyRequest,
  UpdateTwoFactorSettingsRequest,
  UpdateSessionSettingsRequest,
  UpdateApiSecurityRequest,
} from './security-settings.service';

// Sales Module
export { SalesService } from './sales.service';
export type {
  SalesOrder,
  SalesOrderItem,
  SalesOrderListItem,
  SalesOrderStatus,
  SalesOrderStatistics,
  GetSalesOrdersParams,
  CreateSalesOrderCommand,
  CreateSalesOrderItemCommand,
  UpdateSalesOrderCommand,
  AddSalesOrderItemCommand,
  CancelSalesOrderCommand,
} from './sales.service';

export { InvoiceService } from './invoice.service';
export type {
  Invoice,
  InvoiceItem,
  InvoiceListItem,
  InvoiceStatus,
  InvoiceType,
  InvoiceStatistics,
  GetInvoicesParams,
  CreateInvoiceCommand,
  CreateInvoiceFromOrderCommand,
  CreateInvoiceItemCommand,
  UpdateInvoiceCommand,
  AddInvoiceItemCommand,
  RecordPaymentCommand,
  SetEInvoiceCommand,
} from './invoice.service';

export { PaymentService } from './payment.service';
export type {
  Payment,
  PaymentListItem,
  PaymentStatus,
  PaymentMethod,
  PaymentStatistics,
  GetPaymentsParams,
  CreatePaymentCommand,
  UpdatePaymentCommand,
  RefundPaymentCommand,
  RejectPaymentCommand,
} from './payment.service';

// Storage Module
export { StorageService } from './storage.service';
export type {
  StorageUsageResponse,
  BucketExistsResponse,
  BucketNameResponse,
} from './storage.service';

// Tenant Settings Module
export { TenantSettingsService } from './tenant-settings.service';
export type {
  TenantSettingsDto,
  UpdateTenantSettingsRequest,
  TenantStatsDto,
} from './tenant-settings.service';

// Audit Logs Module
export { AuditLogsService } from './audit-logs.service';
export type {
  AuditLogListItem,
  AuditLogDetail,
  AuditLogsResponse,
  AuditLogStatistics,
  SecurityEvent,
  AuditLogFilters,
} from './audit-logs.service';

// Public Pricing Module (No Auth Required)
export { PublicPricingService } from './public-pricing.service';
export type {
  PublicModulePricing,
  PublicBundlePricing,
  PublicAddOnPricing,
  FullPricingResponse,
  CalculatePriceRequest,
  CalculatePriceResponse,
  PriceLineItem,
} from './public-pricing.service';

// Module Pricing Service (Legacy)
export { ModulePricingService } from './module-pricing.service';
export type {
  ModuleDefinitionDto,
  ModuleFeatureDto,
  CustomPackagePriceRequest,
  CustomPackagePriceResponse,
  ModulePriceBreakdown,
  UserPricing,
  StoragePricing,
  AddOnPricing,
} from './module-pricing.service';
