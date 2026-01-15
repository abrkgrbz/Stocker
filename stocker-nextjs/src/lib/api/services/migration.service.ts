/**
 * Data Migration Service
 * Handles data migration operations from external ERP/CRM systems
 * Uses /api/tenant/data-migration endpoints
 */

import { apiClient } from '../client';

// =====================================
// ENUMS
// =====================================

export type MigrationSourceType =
  | 'Excel'
  | 'Logo'
  | 'ETA'
  | 'Mikro'
  | 'Netsis'
  | 'Parasut'
  | 'Other';

export type MigrationEntityType =
  | 'Customer'
  | 'Supplier'
  | 'Product'
  | 'Category'
  | 'Brand'
  | 'Warehouse'
  | 'Unit'
  | 'Contact'
  | 'Address'
  | 'BankAccount'
  | 'OpeningBalance'
  | 'StockMovement'
  | 'PriceList';

export type MigrationSessionStatus =
  | 'Created'
  | 'Uploading'
  | 'Uploaded'
  | 'Validating'
  | 'Validated'
  | 'Importing'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'Expired';

export type ValidationStatus =
  | 'Pending'
  | 'Valid'
  | 'Warning'
  | 'Error'
  | 'Skipped'
  | 'Fixed';

// =====================================
// DTOs
// =====================================

export interface MigrationSessionDto {
  sessionId: string;  // Backend uses SessionId
  id: string;         // Alias for sessionId (computed in getter)
  tenantId: string;
  sourceType: string;
  sourceName: string;
  status: MigrationSessionStatus;
  entities: string[];
  totalRecords: number;
  validRecords: number;
  warningRecords: number;
  errorRecords: number;
  importedRecords: number;
  skippedRecords: number;
  validationProgress: number;
  importProgress: number;
  errorMessage?: string;
  importJobId?: string;
  createdAt: string;
  validatedAt?: string;
  importStartedAt?: string;
  completedAt?: string;
  expiresAt: string;
}

export interface MigrationChunkDto {
  id: string;
  sessionId: string;
  entityType: MigrationEntityType;
  chunkIndex: number;
  totalChunks: number;
  recordCount: number;
  status: 'Received' | 'Validated' | 'Imported' | 'Failed';
  createdAt: string;
  validatedAt?: string;
  importedAt?: string;
}

export interface MigrationValidationResultDto {
  id: string;
  sessionId: string;
  chunkId: string;
  entityType: MigrationEntityType;
  rowIndex: number;
  globalRowIndex: number;
  originalData: Record<string, any>;
  transformedData?: Record<string, any>;
  status: ValidationStatus;
  errors?: string[];
  warnings?: string[];
  userAction?: 'import' | 'skip' | 'fix';
  fixedData?: Record<string, any>;
  createdAt: string;
  validatedAt?: string;
  importedAt?: string;
}

export interface MigrationStatisticsDto {
  totalRecords: number;
  validRecords: number;
  warningRecords: number;
  errorRecords: number;
  pendingRecords: number;
  byEntity: Record<MigrationEntityType, {
    total: number;
    valid: number;
    warning: number;
    error: number;
  }>;
}

export interface FieldMappingDto {
  sourceField: string;
  targetField: string;
  isRequired: boolean;
  defaultValue?: string;
  transformation?: string;
}

export interface MappingConfigDto {
  entityType: MigrationEntityType;
  fieldMappings: FieldMappingDto[];
  autoMapped: boolean;
  confidence: number;
}

export interface MigrationProgressDto {
  sessionId: string;
  status: MigrationSessionStatus;
  phase: 'upload' | 'validation' | 'import';
  progress: number;
  currentEntity?: MigrationEntityType;
  processedRecords: number;
  totalRecords: number;
  estimatedTimeRemaining?: number;
  errors?: string[];
}

// =====================================
// REQUEST DTOs
// =====================================

export interface CreateSessionRequest {
  sourceType: MigrationSourceType;
  sourceName: string;
  entities: MigrationEntityType[];
}

export interface UploadChunkRequest {
  sessionId: string;
  entityType: MigrationEntityType;
  chunkIndex: number;
  totalChunks: number;
  data: Record<string, any>[];
}

export interface SaveMappingRequest {
  sessionId: string;
  mappings: MappingConfigDto[];
}

export interface StartValidationRequest {
  sessionId: string;
}

export interface StartImportRequest {
  sessionId: string;
  skipErrors?: boolean;
  updateExisting?: boolean;
}

export interface FixRecordRequest {
  sessionId: string;
  recordId: string;
  fixedData: Record<string, any>;
}

export interface BulkActionRequest {
  sessionId: string;
  recordIds: string[];
  action: 'import' | 'skip';
}

export interface ValidationFilters {
  sessionId: string;
  entityType?: MigrationEntityType;
  status?: ValidationStatus;
  pageNumber?: number;
  pageSize?: number;
}

// =====================================
// RESPONSE DTOs
// =====================================

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Backend response type for validation preview
// Note: Backend returns errors/warnings as JSON strings, not arrays
interface ValidationResultItemBackend {
  recordId: string;
  rowIndex: number;
  entityType: string;
  status: string;
  originalData: string; // JSON string
  transformedData?: string; // JSON string
  fixedData?: string; // JSON string
  errors?: string; // JSON array string like '["error1", "error2"]'
  warnings?: string; // JSON array string like '["warn1", "warn2"]'
  userAction?: string;
}

interface ValidationPreviewBackendResponse {
  sessionId: string;
  totalRecords: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  fixedCount: number;
  skippedCount: number;
  pendingCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  filter: string;
  records: ValidationResultItemBackend[];
}

// Helper to safely parse JSON strings
function safeJsonParse<T>(json: string | undefined | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// Convert backend record to frontend DTO
function mapBackendRecordToDto(record: ValidationResultItemBackend): MigrationValidationResultDto {
  return {
    id: record.recordId,
    sessionId: '', // Not provided in backend response
    chunkId: '', // Not provided in backend response
    entityType: record.entityType as MigrationEntityType,
    rowIndex: record.rowIndex,
    globalRowIndex: record.rowIndex,
    originalData: safeJsonParse<Record<string, any>>(record.originalData, {}),
    transformedData: record.transformedData ? safeJsonParse<Record<string, any>>(record.transformedData, {}) : undefined,
    status: record.status as ValidationStatus,
    errors: safeJsonParse<string[]>(record.errors, []),
    warnings: safeJsonParse<string[]>(record.warnings, []),
    userAction: record.userAction as 'import' | 'skip' | 'fix' | undefined,
    fixedData: record.fixedData ? safeJsonParse<Record<string, any>>(record.fixedData, {}) : undefined,
    createdAt: '',
    validatedAt: undefined,
    importedAt: undefined,
  };
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AutoMappingSuggestion {
  sourceField: string;
  suggestedTarget: string;
  confidence: number;
  reason: string;
}

// =====================================
// ENTITY FIELD DEFINITIONS
// =====================================

export const entityFields: Record<MigrationEntityType, { name: string; type: string; required: boolean }[]> = {
  Customer: [
    { name: 'code', type: 'string', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'taxNumber', type: 'string', required: false },
    { name: 'email', type: 'string', required: false },
    { name: 'phone', type: 'string', required: false },
    { name: 'address', type: 'string', required: false },
    { name: 'city', type: 'string', required: false },
    { name: 'country', type: 'string', required: false },
    { name: 'creditLimit', type: 'decimal', required: false },
  ],
  Supplier: [
    { name: 'code', type: 'string', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'taxNumber', type: 'string', required: false },
    { name: 'email', type: 'string', required: false },
    { name: 'phone', type: 'string', required: false },
    { name: 'address', type: 'string', required: false },
    { name: 'city', type: 'string', required: false },
    { name: 'country', type: 'string', required: false },
    { name: 'paymentTermDays', type: 'integer', required: false },
  ],
  Product: [
    { name: 'code', type: 'string', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'barcode', type: 'string', required: false },
    { name: 'categoryCode', type: 'string', required: false },
    { name: 'brandCode', type: 'string', required: false },
    { name: 'unitCode', type: 'string', required: false },
    { name: 'purchasePrice', type: 'decimal', required: false },
    { name: 'salePrice', type: 'decimal', required: false },
    { name: 'vatRate', type: 'decimal', required: false },
    { name: 'minStock', type: 'decimal', required: false },
    { name: 'maxStock', type: 'decimal', required: false },
  ],
  Category: [
    { name: 'code', type: 'string', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'parentCode', type: 'string', required: false },
    { name: 'description', type: 'string', required: false },
  ],
  Brand: [
    { name: 'code', type: 'string', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'description', type: 'string', required: false },
  ],
  Warehouse: [
    { name: 'code', type: 'string', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'address', type: 'string', required: false },
    { name: 'city', type: 'string', required: false },
    { name: 'isDefault', type: 'boolean', required: false },
  ],
  Unit: [
    { name: 'code', type: 'string', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'shortName', type: 'string', required: false },
    { name: 'conversionRate', type: 'decimal', required: false },
  ],
  Contact: [
    { name: 'customerCode', type: 'string', required: false },
    { name: 'supplierCode', type: 'string', required: false },
    { name: 'name', type: 'string', required: true },
    { name: 'title', type: 'string', required: false },
    { name: 'email', type: 'string', required: false },
    { name: 'phone', type: 'string', required: false },
    { name: 'mobile', type: 'string', required: false },
  ],
  Address: [
    { name: 'customerCode', type: 'string', required: false },
    { name: 'supplierCode', type: 'string', required: false },
    { name: 'addressType', type: 'string', required: true },
    { name: 'addressLine1', type: 'string', required: true },
    { name: 'addressLine2', type: 'string', required: false },
    { name: 'city', type: 'string', required: true },
    { name: 'district', type: 'string', required: false },
    { name: 'postalCode', type: 'string', required: false },
    { name: 'country', type: 'string', required: false },
  ],
  BankAccount: [
    { name: 'customerCode', type: 'string', required: false },
    { name: 'supplierCode', type: 'string', required: false },
    { name: 'bankName', type: 'string', required: true },
    { name: 'branchName', type: 'string', required: false },
    { name: 'accountNumber', type: 'string', required: true },
    { name: 'iban', type: 'string', required: false },
    { name: 'currency', type: 'string', required: false },
  ],
  OpeningBalance: [
    { name: 'productCode', type: 'string', required: true },
    { name: 'warehouseCode', type: 'string', required: true },
    { name: 'quantity', type: 'decimal', required: true },
    { name: 'unitCost', type: 'decimal', required: false },
    { name: 'date', type: 'date', required: false },
  ],
  StockMovement: [
    { name: 'productCode', type: 'string', required: true },
    { name: 'warehouseCode', type: 'string', required: true },
    { name: 'movementType', type: 'string', required: true },
    { name: 'quantity', type: 'decimal', required: true },
    { name: 'unitCost', type: 'decimal', required: false },
    { name: 'date', type: 'date', required: true },
    { name: 'reference', type: 'string', required: false },
  ],
  PriceList: [
    { name: 'productCode', type: 'string', required: true },
    { name: 'priceListCode', type: 'string', required: true },
    { name: 'price', type: 'decimal', required: true },
    { name: 'currency', type: 'string', required: false },
    { name: 'validFrom', type: 'date', required: false },
    { name: 'validTo', type: 'date', required: false },
  ],
};

// =====================================
// UTILITY FUNCTIONS
// =====================================

export const sourceTypeLabels: Record<MigrationSourceType, string> = {
  Excel: 'Excel / CSV',
  Logo: 'Logo Tiger / Go',
  ETA: 'ETA SQL',
  Mikro: 'Mikro',
  Netsis: 'Netsis',
  Parasut: 'Paraşüt',
  Other: 'Diğer',
};

export const entityTypeLabels: Record<MigrationEntityType, string> = {
  Customer: 'Müşteriler',
  Supplier: 'Tedarikçiler',
  Product: 'Ürünler',
  Category: 'Kategoriler',
  Brand: 'Markalar',
  Warehouse: 'Depolar',
  Unit: 'Birimler',
  Contact: 'Kişiler',
  Address: 'Adresler',
  BankAccount: 'Banka Hesapları',
  OpeningBalance: 'Açılış Stokları',
  StockMovement: 'Stok Hareketleri',
  PriceList: 'Fiyat Listeleri',
};

export const sessionStatusLabels: Record<MigrationSessionStatus, string> = {
  Created: 'Oluşturuldu',
  Uploading: 'Yükleniyor',
  Uploaded: 'Yüklendi',
  Validating: 'Doğrulanıyor',
  Validated: 'Doğrulandı',
  Importing: 'İçe Aktarılıyor',
  Completed: 'Tamamlandı',
  Failed: 'Başarısız',
  Cancelled: 'İptal Edildi',
  Expired: 'Süresi Doldu',
};

export const validationStatusLabels: Record<ValidationStatus, string> = {
  Pending: 'Bekliyor',
  Valid: 'Geçerli',
  Warning: 'Uyarı',
  Error: 'Hata',
  Skipped: 'Atlandı',
  Fixed: 'Düzeltildi',
};

export function getStatusColor(status: MigrationSessionStatus): string {
  const colors: Record<MigrationSessionStatus, string> = {
    Created: 'bg-slate-100 text-slate-700 border-slate-200',
    Uploading: 'bg-blue-50 text-blue-700 border-blue-200',
    Uploaded: 'bg-blue-100 text-blue-700 border-blue-200',
    Validating: 'bg-amber-50 text-amber-700 border-amber-200',
    Validated: 'bg-amber-100 text-amber-700 border-amber-200',
    Importing: 'bg-purple-50 text-purple-700 border-purple-200',
    Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Failed: 'bg-red-100 text-red-700 border-red-200',
    Cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
    Expired: 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
}

export function getValidationStatusColor(status: ValidationStatus): string {
  const colors: Record<ValidationStatus, string> = {
    Pending: 'bg-slate-100 text-slate-600',
    Valid: 'bg-emerald-100 text-emerald-700',
    Warning: 'bg-amber-100 text-amber-700',
    Error: 'bg-red-100 text-red-700',
    Skipped: 'bg-slate-100 text-slate-500',
    Fixed: 'bg-blue-100 text-blue-700',
  };
  return colors[status] || 'bg-slate-100 text-slate-600';
}

// =====================================
// SERVICE CLASS
// =====================================

export const MigrationService = {
  // Session Management
  async createSession(request: CreateSessionRequest): Promise<MigrationSessionDto> {
    const response = await apiClient.post<MigrationSessionDto>('/api/tenant/data-migration/sessions', request);
    // Response is { success: true, data: { sessionId, ... } }
    const data = (response as any)?.data || response;
    // Map sessionId to id for frontend compatibility
    return { ...data, id: data.sessionId };
  },

  async getSession(sessionId: string): Promise<MigrationSessionDto> {
    const response = await apiClient.get<MigrationSessionDto>(`/api/tenant/data-migration/sessions/${sessionId}`);
    // Response is { success: true, data: { sessionId, ... } }
    const data = (response as any)?.data || response;
    // Map sessionId to id for frontend compatibility
    return { ...data, id: data.sessionId };
  },

  async getSessions(): Promise<MigrationSessionDto[]> {
    const response = await apiClient.get<{ sessions: MigrationSessionDto[]; totalCount: number }>('/api/tenant/data-migration/sessions');
    // Response is { success: true, data: { sessions: [...], totalCount, ... } }
    const wrapper = response as any;
    const sessions = wrapper?.data?.sessions || wrapper?.sessions || [];
    // Map sessionId to id for frontend compatibility
    return sessions.map((s: any) => ({ ...s, id: s.sessionId }));
  },

  async cancelSession(sessionId: string): Promise<void> {
    await apiClient.post(`/api/tenant/data-migration/sessions/${sessionId}/cancel`);
  },

  async deleteSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/api/tenant/data-migration/sessions/${sessionId}`);
  },

  // Chunk Upload
  async uploadChunk(request: UploadChunkRequest): Promise<MigrationChunkDto> {
    // Backend endpoint: POST /sessions/{sessionId}/upload
    const response = await apiClient.post<MigrationChunkDto>(
      `/api/tenant/data-migration/sessions/${request.sessionId}/upload`,
      request
    );
    return (response as any)?.data || response;
  },

  async completeUpload(sessionId: string): Promise<void> {
    // Backend endpoint: POST /sessions/{sessionId}/upload/complete
    await apiClient.post(`/api/tenant/data-migration/sessions/${sessionId}/upload/complete`);
  },

  // Field Mapping
  async getAutoMappingSuggestions(sessionId: string, entityType: MigrationEntityType): Promise<AutoMappingSuggestion[]> {
    // Backend endpoint: GET /sessions/{sessionId}/mapping/suggestions?entityType=...
    const response = await apiClient.get<AutoMappingSuggestion[]>(
      `/api/tenant/data-migration/sessions/${sessionId}/mapping/suggestions`,
      { entityType }
    );
    return (response as any)?.data || response || [];
  },

  async saveMapping(request: SaveMappingRequest): Promise<void> {
    // Backend endpoint: POST /sessions/{sessionId}/mapping
    await apiClient.post(`/api/tenant/data-migration/sessions/${request.sessionId}/mapping`, {
      mappingConfig: request.mappings?.[0] || request.mappings,
    });
  },

  // Validation
  async startValidation(sessionId: string): Promise<void> {
    // Backend endpoint: POST /sessions/{sessionId}/validate
    await apiClient.post(`/api/tenant/data-migration/sessions/${sessionId}/validate`);
  },

  async getValidationResults(filters: ValidationFilters): Promise<PagedResult<MigrationValidationResultDto>> {
    // Backend endpoint: GET /sessions/{sessionId}/preview
    // Backend returns ValidationPreviewResponse, we convert it to PagedResult format
    const { sessionId, ...params } = filters;
    const response = await apiClient.get<ValidationPreviewBackendResponse>(
      `/api/tenant/data-migration/sessions/${sessionId}/preview`,
      params
    );

    // Extract the actual response data (may be wrapped in ApiResponse)
    const backendData = (response as any)?.data || response;

    // Convert backend records to frontend DTOs (parse JSON strings to arrays/objects)
    const mappedRecords = (backendData.records || []).map(mapBackendRecordToDto);

    // Convert backend response to PagedResult format expected by frontend
    return {
      items: mappedRecords,
      totalCount: backendData.totalRecords || 0,
      pageNumber: backendData.pageNumber || 1,
      pageSize: backendData.pageSize || 50,
      totalPages: backendData.totalPages || 1,
      hasNext: (backendData.pageNumber || 1) < (backendData.totalPages || 1),
      hasPrevious: (backendData.pageNumber || 1) > 1,
    };
  },

  async getStatistics(sessionId: string): Promise<MigrationStatisticsDto> {
    // Statistics are included in session response, fetch session instead
    const session = await this.getSession(sessionId);
    return {
      totalRecords: session.totalRecords,
      validRecords: session.validRecords,
      warningRecords: session.warningRecords,
      errorRecords: session.errorRecords,
      pendingRecords: session.totalRecords - session.validRecords - session.errorRecords - session.warningRecords,
      byEntity: {} as any, // Not available from session, would need separate endpoint
    };
  },

  // Record Actions
  async fixRecord(request: FixRecordRequest): Promise<MigrationValidationResultDto> {
    // Backend endpoint: PATCH /sessions/{sessionId}/records/{recordId}
    const { sessionId, recordId, fixedData } = request;
    const response = await apiClient.patch<MigrationValidationResultDto>(
      `/api/tenant/data-migration/sessions/${sessionId}/records/${recordId}`,
      { action: 'fix', fixedData: JSON.stringify(fixedData) }
    );
    return (response as any)?.data || response;
  },

  async skipRecord(sessionId: string, recordId: string): Promise<void> {
    // Backend endpoint: PATCH /sessions/{sessionId}/records/{recordId}
    await apiClient.patch(`/api/tenant/data-migration/sessions/${sessionId}/records/${recordId}`, {
      action: 'skip',
    });
  },

  async bulkAction(request: BulkActionRequest): Promise<void> {
    // Backend endpoint: PATCH /sessions/{sessionId}/records/bulk
    await apiClient.patch(`/api/tenant/data-migration/sessions/${request.sessionId}/records/bulk`, {
      recordIds: request.recordIds,
      action: request.action,
    });
  },

  // Import
  async startImport(request: StartImportRequest): Promise<{ jobId: string }> {
    // Backend endpoint: POST /sessions/{sessionId}/commit
    const response = await apiClient.post<{ jobId: string }>(
      `/api/tenant/data-migration/sessions/${request.sessionId}/commit`,
      { options: request }
    );
    return (response as any)?.data || response;
  },

  async getProgress(sessionId: string): Promise<MigrationProgressDto> {
    // Backend endpoint: GET /sessions/{sessionId}/progress
    const response = await apiClient.get<MigrationProgressDto>(`/api/tenant/data-migration/sessions/${sessionId}/progress`);
    return (response as any)?.data || response;
  },

  // Template Download
  async downloadTemplate(entityType: MigrationEntityType): Promise<Blob> {
    // Get auth token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    // Get tenant code from cookie
    const tenantCodeCookie = typeof document !== 'undefined'
      ? document.cookie.split(';').find(c => c.trim().startsWith('tenant-code='))
      : null;
    const tenantCode = tenantCodeCookie ? tenantCodeCookie.split('=')[1]?.trim() : '';

    const headers: Record<string, string> = {
      'X-Tenant-Code': tenantCode,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Use correct endpoint path: /templates/excel/{entityType}
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenant/data-migration/templates/excel/${entityType}`, {
      method: 'GET',
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Template download failed:', response.status, errorText);
      throw new Error('Şablon indirilemedi');
    }

    return response.blob();
  },
};
