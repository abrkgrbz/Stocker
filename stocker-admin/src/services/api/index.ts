// Central API Service Export
export { apiClient } from './apiClient';
export { dashboardService } from './dashboardService';
export { tenantService } from './tenantService';
export { tenantRegistrationService } from './tenantRegistrationService';
export { userService } from './userService';
export { featureService } from './featureService';
export { moduleService } from './moduleService';
export { tenantModuleService } from './tenantModuleService';
export { migrationService } from './migrationService';
export { systemMonitoringService } from './systemMonitoringService';
export { systemManagementService } from './systemManagementService';
export { activityLogService } from './activityLogService';
export { roleService } from './roleService';
export { settingsService } from './settingsService';
export { subscriptionService } from './subscriptionService';
export { storageService } from './storageService';
export { cmsService } from './cmsService';

// Re-export types
export type {
  ApiResponse,
  AuthResponse,
  UserInfo,
  LoginRequest,
} from './apiClient';

export type {
  DashboardStats,
  RevenueOverview,
  TenantStats,
  SystemHealth,
  RecentTenant,
  RecentUser,
  Activity,
} from './dashboardService';

export type {
  TenantDto,
  TenantListDto,
  TenantStatisticsDto,
  CreateTenantCommand,
  UpdateTenantCommand,
  SuspendTenantRequest,
} from './tenantService';

export type {
  TenantRegistrationDto,
  CreateTenantFromRegistrationCommand,
  GetTenantRegistrationsQuery,
} from './tenantRegistrationService';

export type {
  UserDto,
  UserListDto,
  CreateUserCommand,
  UpdateUserCommand,
  ResetPasswordCommand,
  GetUsersQuery,
  UserStatistics,
} from './userService';

export type {
  Feature,
  CreateFeatureDto,
  UpdateFeatureDto,
} from './featureService';

export type {
  Module,
  CreateModuleDto,
  UpdateModuleDto,
} from './moduleService';

export type {
  AvailableModuleDto,
  TenantModuleStatusDto,
  ModuleActivationResult,
} from './tenantModuleService';

export type {
  MigrationModuleDto,
  TenantMigrationStatusDto,
  ApplyMigrationResultDto,
  MigrationHistoryDto,
  MigrationScriptPreviewDto,
  RollbackMigrationResultDto,
  ScheduleMigrationResultDto,
  ScheduledMigrationDto,
  MigrationSettingsDto,
} from './migrationService';

export type {
  SystemMetrics,
  CpuMetrics,
  MemoryMetrics,
  DiskMetrics,
  NetworkMetrics,
  SystemHealth,
  ServiceHealth,
  ServiceStatus,
} from './systemMonitoringService';

export type {
  DockerCacheInfo,
  DockerCleanupResult,
  DockerStats,
  SystemError,
  ErrorStatistics,
} from './systemManagementService';

export type {
  ActivityLog,
  GetActivityLogsQuery,
  ActivityLogsResponse,
} from './activityLogService';

export type {
  Role,
  Permission,
} from './roleService';

export type {
  SettingsDto,
  GeneralSettingsDto,
  EmailSettingsDto,
  SecuritySettingsDto,
  BackupSettingsDto,
  MaintenanceSettingsDto,
  NotificationSettingsDto,
} from './settingsService';

export type {
  BucketInfo,
  BucketsResponse,
  DeleteBucketResponse,
  DeleteMultipleBucketsRequest,
  BucketDeleteResult,
  DeleteMultipleBucketsResponse,
} from './storageService';
