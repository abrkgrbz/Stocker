// Central API Service Export
export { apiClient } from './apiClient';
export { dashboardService } from './dashboardService';
export { tenantService } from './tenantService';
export { userService } from './userService';

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