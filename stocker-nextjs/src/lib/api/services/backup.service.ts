/**
 * Backup Service
 * Handles tenant backup and restore operations
 * Uses /api/tenant/Backup endpoints (tenant-specific)
 */

import { apiClient } from '../client';

// =====================================
// TYPES
// =====================================

export interface BackupDto {
  id: string;
  backupName: string;
  backupType: 'Full' | 'Incremental' | 'Differential';
  status: 'Pending' | 'InProgress' | 'Completed' | 'Failed' | 'Deleted';
  createdAt: string;
  completedAt?: string;
  createdBy: string;
  sizeInBytes: number;
  sizeFormatted?: string;
  storageLocation?: string;
  includesDatabase: boolean;
  includesFiles: boolean;
  includesConfiguration: boolean;
  isCompressed: boolean;
  isEncrypted: boolean;
  isRestorable: boolean;
  expiresAt?: string;
  isExpired?: boolean;
  description?: string;
}

export interface BackupDetailDto extends BackupDto {
  filePath?: string;
  downloadUrl?: string;
  encryptionKey?: string;
  lastRestoredAt?: string;
  restoreCount: number;
  restoreNotes?: string;
  errorMessage?: string;
  retryCount: number;
  tags?: string;
  metadata?: string;
}

export interface BackupStatisticsDto {
  totalBackups: number;
  completedBackups: number;
  pendingBackups: number;
  failedBackups: number;
  totalSizeBytes: number;
  totalSizeFormatted?: string;
  lastBackupDate?: string;
  nextScheduledBackup?: string;
  restorableBackups: number;
  expiredBackups: number;
}

export interface CreateBackupRequest {
  backupName: string;
  backupType: 'Full' | 'Incremental' | 'Differential';
  includeDatabase?: boolean;
  includeFiles?: boolean;
  includeConfiguration?: boolean;
  compress?: boolean;
  encrypt?: boolean;
  description?: string;
}

export interface RestoreBackupRequest {
  notes?: string;
}

// =====================================
// SCHEDULE TYPES
// =====================================

export interface BackupScheduleDto {
  id: string;
  scheduleName: string;
  scheduleType: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
  cronExpression: string;
  backupType: 'Full' | 'Incremental' | 'Differential';
  includeDatabase: boolean;
  includeFiles: boolean;
  includeConfiguration: boolean;
  compress: boolean;
  encrypt: boolean;
  retentionDays: number;
  isEnabled: boolean;
  lastExecutedAt?: string;
  nextExecutionAt?: string;
  successCount: number;
  failureCount: number;
  lastErrorMessage?: string;
  createdAt: string;
}

export interface CreateBackupScheduleRequest {
  scheduleName: string;
  scheduleType: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
  cronExpression: string;
  backupType: 'Full' | 'Incremental' | 'Differential';
  includeDatabase?: boolean;
  includeFiles?: boolean;
  includeConfiguration?: boolean;
  compress?: boolean;
  encrypt?: boolean;
  retentionDays?: number;
}

export type UpdateBackupScheduleRequest = CreateBackupScheduleRequest;

export interface BackupFilters {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  backupType?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDescending?: boolean;
  search?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================================
// UTILITY FUNCTIONS
// =====================================

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Pending':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'InProgress':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Failed':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'Deleted':
      return 'bg-slate-100 text-slate-500 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'Completed':
      return 'Tamamlandı';
    case 'Pending':
      return 'Bekliyor';
    case 'InProgress':
      return 'Devam Ediyor';
    case 'Failed':
      return 'Başarısız';
    case 'Deleted':
      return 'Silindi';
    default:
      return status;
  }
}

export function getBackupTypeLabel(type: string): string {
  switch (type) {
    case 'Full':
      return 'Tam Yedek';
    case 'Incremental':
      return 'Artımlı';
    case 'Differential':
      return 'Fark';
    default:
      return type;
  }
}

export function getScheduleTypeLabel(type: string): string {
  switch (type) {
    case 'Daily':
      return 'Günlük';
    case 'Weekly':
      return 'Haftalık';
    case 'Monthly':
      return 'Aylık';
    case 'Custom':
      return 'Özel';
    default:
      return type;
  }
}

export function getCronDescription(cron: string): string {
  const parts = cron.split(' ');
  if (parts.length < 5) return cron;

  const [minute, hour, dayOfMonth, , dayOfWeek] = parts;

  // Daily: 0 2 * * *
  if (dayOfMonth === '*' && dayOfWeek === '*') {
    return `Her gün saat ${hour}:${minute.padStart(2, '0')}`;
  }

  // Weekly: 0 3 * * 0
  if (dayOfMonth === '*' && dayOfWeek !== '*') {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dayIndex = parseInt(dayOfWeek);
    return `Her ${days[dayIndex]} saat ${hour}:${minute.padStart(2, '0')}`;
  }

  // Monthly: 0 4 1 * *
  if (dayOfMonth !== '*' && dayOfWeek === '*') {
    return `Her ayın ${dayOfMonth}. günü saat ${hour}:${minute.padStart(2, '0')}`;
  }

  return cron;
}

// =====================================
// SERVICE
// =====================================

export const BackupService = {
  /**
   * Get paginated backups with filtering
   */
  async getBackups(filters?: BackupFilters): Promise<PagedResult<BackupDto>> {
    const params = new URLSearchParams();

    if (filters?.pageNumber) params.append('pageNumber', filters.pageNumber.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.backupType) params.append('backupType', filters.backupType);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortDescending !== undefined) params.append('sortDescending', filters.sortDescending.toString());
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = `/api/tenant/Backup${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ApiResponseWrapper<PagedResult<BackupDto>>>(url);
    return (response as unknown as ApiResponseWrapper<PagedResult<BackupDto>>).data || response as unknown as PagedResult<BackupDto>;
  },

  /**
   * Get backup by ID
   */
  async getBackupById(id: string): Promise<BackupDetailDto> {
    const response = await apiClient.get<ApiResponseWrapper<BackupDetailDto>>(
      `/api/tenant/Backup/${id}`
    );
    return (response as unknown as ApiResponseWrapper<BackupDetailDto>).data || response as unknown as BackupDetailDto;
  },

  /**
   * Get backup statistics
   */
  async getStatistics(): Promise<BackupStatisticsDto> {
    const response = await apiClient.get<ApiResponseWrapper<BackupStatisticsDto>>(
      '/api/tenant/Backup/statistics'
    );
    return (response as unknown as ApiResponseWrapper<BackupStatisticsDto>).data || response as unknown as BackupStatisticsDto;
  },

  /**
   * Create a new backup
   */
  async createBackup(request: CreateBackupRequest): Promise<BackupDto> {
    const response = await apiClient.post<ApiResponseWrapper<BackupDto>>(
      '/api/tenant/Backup',
      request
    );
    return (response as unknown as ApiResponseWrapper<BackupDto>).data || response as unknown as BackupDto;
  },

  /**
   * Delete a backup
   */
  async deleteBackup(id: string): Promise<void> {
    await apiClient.delete(`/api/tenant/Backup/${id}`);
  },

  /**
   * Restore from a backup
   */
  async restoreBackup(id: string, request?: RestoreBackupRequest): Promise<void> {
    await apiClient.post(`/api/tenant/Backup/${id}/restore`, request || {});
  },

  /**
   * Get download URL for a backup
   */
  async getDownloadUrl(id: string, expiryMinutes = 60): Promise<{ downloadUrl: string; fileName: string; expiresAt: string }> {
    const response = await apiClient.get<ApiResponseWrapper<{ downloadUrl: string; fileName: string; expiresAt: string }>>(
      `/api/tenant/Backup/${id}/download?expiryMinutes=${expiryMinutes}`
    );
    return (response as unknown as ApiResponseWrapper<{ downloadUrl: string; fileName: string; expiresAt: string }>).data || response as unknown as { downloadUrl: string; fileName: string; expiresAt: string };
  },

  // =====================================
  // SCHEDULE METHODS
  // =====================================

  /**
   * Get all backup schedules
   */
  async getSchedules(): Promise<BackupScheduleDto[]> {
    const response = await apiClient.get<ApiResponseWrapper<BackupScheduleDto[]>>(
      '/api/tenant/Backup/schedules'
    );
    return (response as unknown as ApiResponseWrapper<BackupScheduleDto[]>).data || response as unknown as BackupScheduleDto[];
  },

  /**
   * Get a specific schedule
   */
  async getScheduleById(id: string): Promise<BackupScheduleDto> {
    const response = await apiClient.get<ApiResponseWrapper<BackupScheduleDto>>(
      `/api/tenant/Backup/schedules/${id}`
    );
    return (response as unknown as ApiResponseWrapper<BackupScheduleDto>).data || response as unknown as BackupScheduleDto;
  },

  /**
   * Create a new backup schedule
   */
  async createSchedule(request: CreateBackupScheduleRequest): Promise<BackupScheduleDto> {
    const response = await apiClient.post<ApiResponseWrapper<BackupScheduleDto>>(
      '/api/tenant/Backup/schedules',
      request
    );
    return (response as unknown as ApiResponseWrapper<BackupScheduleDto>).data || response as unknown as BackupScheduleDto;
  },

  /**
   * Update a backup schedule
   */
  async updateSchedule(id: string, request: UpdateBackupScheduleRequest): Promise<void> {
    await apiClient.put(`/api/tenant/Backup/schedules/${id}`, request);
  },

  /**
   * Delete a backup schedule
   */
  async deleteSchedule(id: string): Promise<void> {
    await apiClient.delete(`/api/tenant/Backup/schedules/${id}`);
  },

  /**
   * Enable a backup schedule
   */
  async enableSchedule(id: string): Promise<void> {
    await apiClient.post(`/api/tenant/Backup/schedules/${id}/enable`, {});
  },

  /**
   * Disable a backup schedule
   */
  async disableSchedule(id: string): Promise<void> {
    await apiClient.post(`/api/tenant/Backup/schedules/${id}/disable`, {});
  },

  /**
   * Trigger manual cleanup
   */
  async triggerCleanup(retentionDays = 30): Promise<{ jobId: string }> {
    const response = await apiClient.post<ApiResponseWrapper<{ jobId: string }>>(
      `/api/tenant/Backup/cleanup?retentionDays=${retentionDays}`,
      {}
    );
    return (response as unknown as ApiResponseWrapper<{ jobId: string }>).data || response as unknown as { jobId: string };
  },
};

export default BackupService;
