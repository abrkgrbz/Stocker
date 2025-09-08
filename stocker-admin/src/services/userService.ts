import axiosInstance from '../lib/axios';
import type {
  User,
  UserFilters,
  CreateUserRequest,
  UpdateUserRequest,
  UserListResponse,
  BulkUserAction,
  UserStats,
  UserActivity,
  UserSession,
  UserLoginHistory,
  PasswordResetRequest,
  TwoFactorSetupRequest,
  UserExportOptions,
} from '../types/user';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class UserService {
  private api = axiosInstance;

  async getUsers(
    page: number = 1,
    pageSize: number = 25,
    filters: UserFilters = {}
  ): Promise<UserListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await this.api.get(`/api/master/users?${params}`);
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.api.get(`/api/master/users/${id}`);
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.api.post('/api/master/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await this.api.put(`/api/master/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/api/master/users/${id}`);
  }

  async getUserStats(): Promise<UserStats> {
    const response = await this.api.get('/api/master/users/stats');
    return response.data;
  }

  async getUserActivities(userId: string, page: number = 1, pageSize: number = 50): Promise<{
    data: UserActivity[];
    totalCount: number;
  }> {
    const response = await this.api.get(`/api/master/users/${userId}/activities`, {
      params: { page, pageSize }
    });
    return response.data;
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    const response = await this.api.get(`/api/master/users/${userId}/sessions`);
    return response.data;
  }

  async revokeUserSession(userId: string, sessionId: string): Promise<void> {
    await this.api.delete(`/api/master/users/${userId}/sessions/${sessionId}`);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.api.delete(`/api/master/users/${userId}/sessions`);
  }

  async getUserLoginHistory(userId: string, page: number = 1, pageSize: number = 50): Promise<{
    data: UserLoginHistory[];
    totalCount: number;
  }> {
    const response = await this.api.get(`/api/master/users/${userId}/login-history`, {
      params: { page, pageSize }
    });
    return response.data;
  }

  async resetUserPassword(data: PasswordResetRequest): Promise<{ temporaryPassword?: string }> {
    const response = await this.api.post(`/api/master/users/${data.userId}/reset-password`, data);
    return response.data;
  }

  async setupTwoFactor(data: TwoFactorSetupRequest): Promise<{ qrCode?: string; backupCodes?: string[] }> {
    const response = await this.api.post(`/api/master/users/${data.userId}/two-factor`, data);
    return response.data;
  }

  async verifyUserEmail(userId: string): Promise<void> {
    await this.api.post(`/api/master/users/${userId}/verify-email`);
  }

  async resendVerificationEmail(userId: string): Promise<void> {
    await this.api.post(`/api/master/users/${userId}/resend-verification`);
  }

  async lockUser(userId: string, reason?: string): Promise<void> {
    await this.api.post(`/api/master/users/${userId}/lock`, { reason });
  }

  async unlockUser(userId: string): Promise<void> {
    await this.api.post(`/api/master/users/${userId}/unlock`);
  }

  async bulkAction(action: BulkUserAction): Promise<{
    success: number;
    failed: number;
    errors: Array<{ userId: string; error: string }>;
  }> {
    const response = await this.api.post('/api/master/users/bulk-action', action);
    return response.data;
  }

  async exportUsers(options: UserExportOptions & { userIds?: string[] }): Promise<Blob> {
    const response = await this.api.post('/api/master/users/export', options, {
      responseType: 'blob'
    });
    return response.data;
  }

  async impersonateUser(userId: string): Promise<{ token: string; redirectUrl: string }> {
    const response = await this.api.post(`/api/master/users/${userId}/impersonate`);
    return response.data;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const response = await this.api.get(`/api/master/users/${userId}/permissions`);
    return response.data;
  }

  async updateUserPermissions(userId: string, permissions: string[]): Promise<void> {
    await this.api.put(`/api/master/users/${userId}/permissions`, { permissions });
  }

  // Mock data for development
  private generateMockUsers(): User[] {
    const mockUsers: User[] = [];
    const tenants = [
      { id: '1', name: 'Acme Corp' },
      { id: '2', name: 'TechStart Inc' },
      { id: '3', name: 'Global Systems' },
      { id: '4', name: 'Innovation Labs' },
    ];

    const roles: Array<{ role: any; permissions: any[] }> = [
      { role: 'admin', permissions: ['users.read', 'users.write', 'users.delete', 'settings.read', 'settings.write', 'reports.read', 'reports.write', 'billing.read', 'billing.write'] },
      { role: 'manager', permissions: ['users.read', 'users.write', 'settings.read', 'reports.read', 'reports.write'] },
      { role: 'user', permissions: ['users.read', 'settings.read', 'reports.read'] },
      { role: 'viewer', permissions: ['users.read', 'reports.read'] },
    ];

    const statuses: any[] = ['active', 'inactive', 'suspended', 'pending_verification'];
    const firstNames = ['Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Ali', 'Zeynep', 'Mustafa', 'Elif', 'Emre', 'Selin'];
    const lastNames = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç'];

    for (let i = 1; i <= 150; i++) {
      const tenant = tenants[Math.floor(Math.random() * tenants.length)];
      const roleData = roles[Math.floor(Math.random() * roles.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      const user: User = {
        id: i.toString(),
        tenantId: tenant.id,
        tenantName: tenant.name,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${tenant.name.toLowerCase().replace(/\s+/g, '')}.com`,
        role: roleData.role,
        permissions: roleData.permissions,
        status,
        profile: {
          firstName,
          lastName,
          phone: `+90 5${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
          department: ['IT', 'İnsan Kaynakları', 'Satış', 'Pazarlama', 'Finans'][Math.floor(Math.random() * 5)],
          position: ['Uzman', 'Kıdemli Uzman', 'Yönetici', 'Müdür', 'Direktör'][Math.floor(Math.random() * 5)],
          location: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'][Math.floor(Math.random() * 5)],
          timezone: 'Europe/Istanbul',
          language: 'tr',
          theme: 'light',
        },
        security: {
          twoFactorEnabled: Math.random() > 0.6,
          lastPasswordChange: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          loginAttempts: 0,
          emailVerified: Math.random() > 0.1,
        },
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastLoginAt: status === 'active' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        lastActivityAt: status === 'active' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
        stats: {
          totalLogins: Math.floor(Math.random() * 1000) + 10,
          failedLoginAttempts: Math.floor(Math.random() * 5),
          dataExportsCount: Math.floor(Math.random() * 20),
          lastPasswordStrength: Math.floor(Math.random() * 40) + 60,
          averageSessionDuration: Math.floor(Math.random() * 300) + 60,
        },
        activeSessions: [],
      };

      mockUsers.push(user);
    }

    return mockUsers;
  }

  private mockUsers = this.generateMockUsers();

  // Override methods with mock data in development
  async getMockUsers(
    page: number = 1,
    pageSize: number = 25,
    filters: UserFilters = {}
  ): Promise<UserListResponse> {
    let filteredUsers = [...this.mockUsers];

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.email.toLowerCase().includes(searchTerm) ||
        user.profile.firstName.toLowerCase().includes(searchTerm) ||
        user.profile.lastName.toLowerCase().includes(searchTerm) ||
        user.tenantName.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.tenantId?.length) {
      filteredUsers = filteredUsers.filter(user => filters.tenantId!.includes(user.tenantId));
    }

    if (filters.role?.length) {
      filteredUsers = filteredUsers.filter(user => filters.role!.includes(user.role));
    }

    if (filters.status?.length) {
      filteredUsers = filteredUsers.filter(user => filters.status!.includes(user.status));
    }

    if (filters.emailVerified !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.security.emailVerified === filters.emailVerified);
    }

    if (filters.twoFactorEnabled !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.security.twoFactorEnabled === filters.twoFactorEnabled);
    }

    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      data: paginatedUsers,
      totalCount: filteredUsers.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredUsers.length / pageSize),
    };
  }

  async getMockUserStats(): Promise<UserStats> {
    const totalUsers = this.mockUsers.length;
    const activeUsers = this.mockUsers.filter(u => u.status === 'active').length;
    const inactiveUsers = this.mockUsers.filter(u => u.status === 'inactive').length;
    const suspendedUsers = this.mockUsers.filter(u => u.status === 'suspended').length;
    const pendingVerificationUsers = this.mockUsers.filter(u => u.status === 'pending_verification').length;
    const usersWithTwoFactor = this.mockUsers.filter(u => u.security.twoFactorEnabled).length;

    const roleDistribution = {
      admin: this.mockUsers.filter(u => u.role === 'admin').length,
      manager: this.mockUsers.filter(u => u.role === 'manager').length,
      user: this.mockUsers.filter(u => u.role === 'user').length,
      viewer: this.mockUsers.filter(u => u.role === 'viewer').length,
    };

    const tenantDistribution: Record<string, number> = {};
    this.mockUsers.forEach(user => {
      tenantDistribution[user.tenantName] = (tenantDistribution[user.tenantName] || 0) + 1;
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      pendingVerificationUsers,
      usersWithTwoFactor,
      averageLoginsPerUser: Math.round(this.mockUsers.reduce((sum, user) => sum + user.stats.totalLogins, 0) / totalUsers),
      roleDistribution,
      tenantDistribution,
    };
  }
}

const userService = new UserService();

// Use mock data in development
if (import.meta.env.DEV) {
  // Override with mock methods
  userService.getUsers = userService.getMockUsers.bind(userService);
  userService.getUserStats = userService.getMockUserStats.bind(userService);
}

export default userService;