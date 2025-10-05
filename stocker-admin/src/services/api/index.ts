// Central API Service Export
export { apiClient } from './apiClient';
export { dashboardService } from './dashboardService';
export { tenantService } from './tenantService';
export { userService } from './userService';
export { featureService } from './featureService';
export { moduleService } from './moduleService';

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
