export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';

export type Permission = 
  | 'users.read' 
  | 'users.write' 
  | 'users.delete'
  | 'settings.read'
  | 'settings.write'
  | 'reports.read'
  | 'reports.write'
  | 'billing.read'
  | 'billing.write';

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  department?: string;
  position?: string;
  location?: string;
  timezone?: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface UserSecurity {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
  loginAttempts: number;
  lockoutUntil?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'password_change' | 'profile_update' | 'permission_change' | 'data_export';
  description: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
    isMobile: boolean;
  };
  ipAddress: string;
  location?: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
}

export interface UserLoginHistory {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  success: boolean;
  failureReason?: string;
  timestamp: string;
  sessionId?: string;
}

export interface User {
  id: string;
  tenantId: string;
  tenantName: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  status: UserStatus;
  profile: UserProfile;
  security: UserSecurity;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastActivityAt?: string;
  
  // Statistics
  stats: {
    totalLogins: number;
    failedLoginAttempts: number;
    dataExportsCount: number;
    lastPasswordStrength: number;
    averageSessionDuration: number;
  };
  
  // Current sessions
  activeSessions: UserSession[];
}

export interface UserFilters {
  tenantId?: string[];
  role?: UserRole[];
  status?: UserStatus[];
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  lastActivity?: {
    start: string;
    end: string;
  };
}

export interface CreateUserRequest {
  tenantId: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  profile: Omit<UserProfile, 'avatar'>;
  sendWelcomeEmail?: boolean;
  requirePasswordChange?: boolean;
}

export interface UpdateUserRequest {
  role?: UserRole;
  permissions?: Permission[];
  status?: UserStatus;
  profile?: Partial<UserProfile>;
  security?: Partial<Pick<UserSecurity, 'twoFactorEnabled' | 'emailVerified'>>;
}

export interface UserListResponse {
  data: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BulkUserAction {
  action: 'activate' | 'deactivate' | 'suspend' | 'delete' | 'change_role' | 'reset_password' | 'export';
  userIds: string[];
  params?: {
    newRole?: UserRole;
    reason?: string;
    sendNotification?: boolean;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  pendingVerificationUsers: number;
  usersWithTwoFactor: number;
  averageLoginsPerUser: number;
  roleDistribution: {
    admin: number;
    manager: number;
    user: number;
    viewer: number;
  };
  tenantDistribution: Record<string, number>;
}

export interface PasswordResetRequest {
  userId: string;
  sendEmail?: boolean;
  requireImmedateChange?: boolean;
}

export interface TwoFactorSetupRequest {
  userId: string;
  enable: boolean;
  method: 'totp' | 'sms';
}

export interface UserExportOptions {
  format: 'csv' | 'excel' | 'json';
  fields: string[];
  includeActivities?: boolean;
  includeSessions?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}