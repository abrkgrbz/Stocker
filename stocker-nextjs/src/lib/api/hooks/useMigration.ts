/**
 * Data Migration React Query Hooks
 * Provides data fetching and mutations for migration operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MigrationService } from '../services/migration.service';
import type {
  MigrationSessionDto,
  MigrationChunkDto,
  MigrationValidationResultDto,
  MigrationStatisticsDto,
  MigrationProgressDto,
  MappingConfigDto,
  CreateSessionRequest,
  UploadChunkRequest,
  SaveMappingRequest,
  StartImportRequest,
  FixRecordRequest,
  BulkActionRequest,
  ValidationFilters,
  PagedResult,
  MigrationEntityType,
  AutoMappingSuggestion,
} from '../services/migration.service';

// Query Keys
export const migrationKeys = {
  all: ['migration'] as const,
  sessions: () => [...migrationKeys.all, 'sessions'] as const,
  session: (id: string) => [...migrationKeys.sessions(), id] as const,
  chunks: (sessionId: string) => [...migrationKeys.session(sessionId), 'chunks'] as const,
  mappings: (sessionId: string) => [...migrationKeys.session(sessionId), 'mappings'] as const,
  validationResults: (sessionId: string, filters?: Partial<ValidationFilters>) =>
    [...migrationKeys.session(sessionId), 'validation', filters] as const,
  statistics: (sessionId: string) => [...migrationKeys.session(sessionId), 'statistics'] as const,
  progress: (sessionId: string) => [...migrationKeys.session(sessionId), 'progress'] as const,
};

// =====================================
// SESSION HOOKS
// =====================================

/**
 * Hook to fetch all migration sessions
 */
export function useMigrationSessions() {
  return useQuery<MigrationSessionDto[], Error>({
    queryKey: migrationKeys.sessions(),
    queryFn: () => MigrationService.getSessions(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single session by ID
 */
export function useMigrationSession(sessionId: string, options?: { enabled?: boolean; refetchInterval?: number }) {
  // Ensure sessionId is a valid non-empty string (not 'undefined' or empty)
  const isValidSessionId = !!sessionId && sessionId !== 'undefined' && sessionId.length > 0;

  return useQuery<MigrationSessionDto, Error>({
    queryKey: migrationKeys.session(sessionId),
    queryFn: () => MigrationService.getSession(sessionId),
    enabled: isValidSessionId && (options?.enabled !== false),
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook to create a new migration session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation<MigrationSessionDto, Error, CreateSessionRequest>({
    mutationFn: (request) => MigrationService.createSession(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: migrationKeys.sessions() });
    },
  });
}

/**
 * Hook to cancel a migration session
 */
export function useCancelSession() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (sessionId) => MigrationService.cancelSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: migrationKeys.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: migrationKeys.sessions() });
    },
  });
}

/**
 * Hook to delete a migration session
 */
export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (sessionId) => MigrationService.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: migrationKeys.sessions() });
    },
  });
}

// =====================================
// CHUNK UPLOAD HOOKS
// =====================================

/**
 * Hook to get chunks for a session
 */
export function useMigrationChunks(sessionId: string, options?: { enabled?: boolean }) {
  return useQuery<MigrationChunkDto[], Error>({
    queryKey: migrationKeys.chunks(sessionId),
    queryFn: () => MigrationService.getChunks(sessionId),
    enabled: !!sessionId && (options?.enabled !== false),
  });
}

/**
 * Hook to upload a chunk
 */
export function useUploadChunk() {
  const queryClient = useQueryClient();

  return useMutation<MigrationChunkDto, Error, UploadChunkRequest>({
    mutationFn: (request) => MigrationService.uploadChunk(request),
    onSuccess: (_, request) => {
      queryClient.invalidateQueries({ queryKey: migrationKeys.chunks(request.sessionId) });
      queryClient.invalidateQueries({ queryKey: migrationKeys.session(request.sessionId) });
    },
  });
}

// =====================================
// MAPPING HOOKS
// =====================================

/**
 * Hook to get field mappings for a session
 */
export function useMigrationMappings(sessionId: string, options?: { enabled?: boolean }) {
  return useQuery<MappingConfigDto[], Error>({
    queryKey: migrationKeys.mappings(sessionId),
    queryFn: () => MigrationService.getMappings(sessionId),
    enabled: !!sessionId && (options?.enabled !== false),
  });
}

/**
 * Hook to get auto-mapping suggestions
 */
export function useAutoMappingSuggestions() {
  return useMutation<
    AutoMappingSuggestion[],
    Error,
    { sessionId: string; entityType: MigrationEntityType; sampleData: Record<string, any>[] }
  >({
    mutationFn: ({ sessionId, entityType, sampleData }) =>
      MigrationService.getAutoMappingSuggestions(sessionId, entityType, sampleData),
  });
}

/**
 * Hook to save field mappings
 */
export function useSaveMapping() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, SaveMappingRequest>({
    mutationFn: (request) => MigrationService.saveMapping(request),
    onSuccess: (_, request) => {
      queryClient.invalidateQueries({ queryKey: migrationKeys.mappings(request.sessionId) });
    },
  });
}

// =====================================
// VALIDATION HOOKS
// =====================================

/**
 * Hook to start validation
 */
export function useStartValidation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (sessionId) => MigrationService.startValidation(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: migrationKeys.session(sessionId) });
    },
  });
}

/**
 * Hook to get validation results with pagination
 */
export function useValidationResults(filters: ValidationFilters, options?: { enabled?: boolean }) {
  return useQuery<PagedResult<MigrationValidationResultDto>, Error>({
    queryKey: migrationKeys.validationResults(filters.sessionId, filters),
    queryFn: () => MigrationService.getValidationResults(filters),
    enabled: !!filters.sessionId && (options?.enabled !== false),
  });
}

/**
 * Hook to get migration statistics
 */
export function useMigrationStatistics(sessionId: string, options?: { enabled?: boolean }) {
  return useQuery<MigrationStatisticsDto, Error>({
    queryKey: migrationKeys.statistics(sessionId),
    queryFn: () => MigrationService.getStatistics(sessionId),
    enabled: !!sessionId && (options?.enabled !== false),
  });
}

// =====================================
// RECORD ACTION HOOKS
// =====================================

/**
 * Hook to fix a validation record
 */
export function useFixRecord() {
  const queryClient = useQueryClient();

  return useMutation<MigrationValidationResultDto, Error, FixRecordRequest>({
    mutationFn: (request) => MigrationService.fixRecord(request),
    onSuccess: (_, request) => {
      queryClient.invalidateQueries({ queryKey: migrationKeys.validationResults(request.sessionId) });
      queryClient.invalidateQueries({ queryKey: migrationKeys.statistics(request.sessionId) });
    },
  });
}

/**
 * Hook to skip a validation record
 */
export function useSkipRecord() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { sessionId: string; recordId: string }>({
    mutationFn: ({ sessionId, recordId }) => MigrationService.skipRecord(sessionId, recordId),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: migrationKeys.validationResults(sessionId) });
      queryClient.invalidateQueries({ queryKey: migrationKeys.statistics(sessionId) });
    },
  });
}

/**
 * Hook to perform bulk action on records
 */
export function useBulkAction() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, BulkActionRequest>({
    mutationFn: (request) => MigrationService.bulkAction(request),
    onSuccess: (_, request) => {
      queryClient.invalidateQueries({ queryKey: migrationKeys.validationResults(request.sessionId) });
      queryClient.invalidateQueries({ queryKey: migrationKeys.statistics(request.sessionId) });
    },
  });
}

// =====================================
// IMPORT HOOKS
// =====================================

/**
 * Hook to start import process
 */
export function useStartImport() {
  const queryClient = useQueryClient();

  return useMutation<{ jobId: string }, Error, StartImportRequest>({
    mutationFn: (request) => MigrationService.startImport(request),
    onSuccess: (_, request) => {
      queryClient.invalidateQueries({ queryKey: migrationKeys.session(request.sessionId) });
    },
  });
}

/**
 * Hook to get migration progress
 */
export function useMigrationProgress(sessionId: string, options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery<MigrationProgressDto, Error>({
    queryKey: migrationKeys.progress(sessionId),
    queryFn: () => MigrationService.getProgress(sessionId),
    enabled: !!sessionId && (options?.enabled !== false),
    refetchInterval: options?.refetchInterval || 2000, // Poll every 2 seconds by default
  });
}

// =====================================
// TEMPLATE DOWNLOAD HOOK
// =====================================

/**
 * Hook to download a template
 */
export function useDownloadTemplate() {
  return useMutation<Blob, Error, MigrationEntityType>({
    mutationFn: (entityType) => MigrationService.downloadTemplate(entityType),
    onSuccess: (blob, entityType) => {
      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${entityType.toLowerCase()}_template.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

// Re-export types for convenience
export type {
  MigrationSessionDto,
  MigrationChunkDto,
  MigrationValidationResultDto,
  MigrationStatisticsDto,
  MigrationProgressDto,
  MappingConfigDto,
  CreateSessionRequest,
  UploadChunkRequest,
  SaveMappingRequest,
  StartImportRequest,
  FixRecordRequest,
  BulkActionRequest,
  ValidationFilters,
  MigrationEntityType,
  MigrationSourceType,
  MigrationSessionStatus,
  ValidationStatus,
} from '../services/migration.service';

// Re-export utility functions
export {
  sourceTypeLabels,
  entityTypeLabels,
  sessionStatusLabels,
  validationStatusLabels,
  getStatusColor,
  getValidationStatusColor,
  entityFields,
} from '../services/migration.service';
