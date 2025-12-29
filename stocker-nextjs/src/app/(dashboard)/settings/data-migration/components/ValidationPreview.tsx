'use client';

/**
 * Validation Preview Step
 * Review validation results and fix/skip records with errors
 */

import { useState, useMemo } from 'react';
import { Spinner } from '@/components/primitives';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  Filter,
  Eye,
  Edit2,
  SkipForward,
  RefreshCw,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import {
  useValidationResults,
  useMigrationStatistics,
  useMigrationSession,
  useFixRecord,
  useSkipRecord,
  useBulkAction,
  useStartImport,
  entityTypeLabels,
  validationStatusLabels,
  getValidationStatusColor,
} from '@/lib/api/hooks/useMigration';
import type {
  MigrationSessionDto,
  MigrationEntityType,
  MigrationValidationResultDto,
  ValidationStatus,
} from '@/lib/api/services/migration.service';

interface ValidationPreviewProps {
  sessionId: string;
  session: MigrationSessionDto | undefined;
  onNext: () => void;
  onBack: () => void;
}

export default function ValidationPreview({ sessionId, session, onNext, onBack }: ValidationPreviewProps) {
  const [selectedEntity, setSelectedEntity] = useState<MigrationEntityType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ValidationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [editingRecord, setEditingRecord] = useState<MigrationValidationResultDto | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const pageSize = 20;

  // Fetch validation results
  const { data: resultsData, isLoading: resultsLoading, refetch } = useValidationResults({
    sessionId,
    entityType: selectedEntity === 'all' ? undefined : selectedEntity,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    pageNumber: page,
    pageSize,
  }, {
    enabled: !!sessionId && session?.status !== 'Validating',
  });

  // Fetch statistics
  const { data: statistics, isLoading: statsLoading } = useMigrationStatistics(sessionId, {
    enabled: !!sessionId,
  });

  // Re-fetch session to check status
  const { data: currentSession } = useMigrationSession(sessionId, {
    enabled: !!sessionId,
    refetchInterval: session?.status === 'Validating' ? 2000 : undefined,
  });

  // Mutations
  const fixRecord = useFixRecord();
  const skipRecord = useSkipRecord();
  const bulkAction = useBulkAction();
  const startImport = useStartImport();

  const results = resultsData?.items || [];
  const totalCount = resultsData?.totalCount || 0;
  const totalPages = resultsData?.totalPages || 1;

  // Check if validation is still in progress
  const isValidating = currentSession?.status === 'Validating';

  // Handle record selection
  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const toggleAllRecords = () => {
    if (selectedRecords.size === results.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(results.map(r => r.id)));
    }
  };

  // Handle fix record
  const handleSaveEdit = async () => {
    if (!editingRecord) return;

    try {
      await fixRecord.mutateAsync({
        sessionId,
        recordId: editingRecord.id,
        fixedData: editedData,
      });
      setEditingRecord(null);
      setEditedData({});
      refetch();
    } catch {
      // Error handled by mutation
    }
  };

  // Handle skip record
  const handleSkipRecord = async (recordId: string) => {
    try {
      await skipRecord.mutateAsync({ sessionId, recordId });
      refetch();
    } catch {
      // Error handled by mutation
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: 'import' | 'skip') => {
    if (selectedRecords.size === 0) return;

    try {
      await bulkAction.mutateAsync({
        sessionId,
        recordIds: Array.from(selectedRecords),
        action,
      });
      setSelectedRecords(new Set());
      refetch();
    } catch {
      // Error handled by mutation
    }
  };

  // Handle start import
  const handleStartImport = async () => {
    try {
      await startImport.mutateAsync({
        sessionId,
        skipErrors: true,
        updateExisting: false,
      });
      onNext();
    } catch {
      // Error handled by mutation
    }
  };

  // Open edit modal
  const openEditModal = (record: MigrationValidationResultDto) => {
    setEditingRecord(record);
    setEditedData(record.originalData);
  };

  // Can proceed to import?
  const canProceed = !isValidating && (statistics?.validRecords || 0) + (statistics?.warningRecords || 0) > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Validation Progress (if still running) */}
      {isValidating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <p className="text-sm font-medium text-blue-900">Doğrulama Devam Ediyor</p>
              <p className="text-xs text-blue-700">Verileriniz kontrol ediliyor, lütfen bekleyin...</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {!isValidating && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-slate-100 rounded">
                <CheckCircle2 className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase">Toplam</span>
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              {statsLoading ? '...' : statistics?.totalRecords.toLocaleString('tr-TR')}
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-emerald-100 rounded">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-emerald-600 uppercase">Geçerli</span>
            </div>
            <p className="text-2xl font-semibold text-emerald-700">
              {statsLoading ? '...' : statistics?.validRecords.toLocaleString('tr-TR')}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-amber-100 rounded">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-amber-600 uppercase">Uyarı</span>
            </div>
            <p className="text-2xl font-semibold text-amber-700">
              {statsLoading ? '...' : statistics?.warningRecords.toLocaleString('tr-TR')}
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-red-100 rounded">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-xs font-medium text-red-600 uppercase">Hata</span>
            </div>
            <p className="text-2xl font-semibold text-red-700">
              {statsLoading ? '...' : statistics?.errorRecords.toLocaleString('tr-TR')}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-slate-100 rounded">
                <AlertCircle className="w-4 h-4 text-slate-500" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase">Bekliyor</span>
            </div>
            <p className="text-2xl font-semibold text-slate-700">
              {statsLoading ? '...' : statistics?.pendingRecords.toLocaleString('tr-TR')}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      {!isValidating && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Kayıt ara..."
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Entity Filter */}
            <select
              value={selectedEntity}
              onChange={(e) => {
                setSelectedEntity(e.target.value as MigrationEntityType | 'all');
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">Tüm Veri Türleri</option>
              {session?.entities.map(entity => (
                <option key={entity} value={entity}>{entityTypeLabels[entity as MigrationEntityType]}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as ValidationStatus | 'all');
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="Valid">Geçerli</option>
              <option value="Warning">Uyarı</option>
              <option value="Error">Hata</option>
              <option value="Fixed">Düzeltildi</option>
              <option value="Skipped">Atlandı</option>
            </select>

            {/* Refresh */}
            <button
              onClick={() => refetch()}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedRecords.size > 0 && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200">
              <span className="text-sm text-slate-600">
                {selectedRecords.size} kayıt seçili
              </span>
              <button
                onClick={() => handleBulkAction('skip')}
                disabled={bulkAction.isPending}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                Tümünü Atla
              </button>
              <button
                onClick={() => setSelectedRecords(new Set())}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Seçimi Temizle
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Table */}
      {!isValidating && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {resultsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-slate-900 mb-1">Kayıt Bulunamadı</h3>
              <p className="text-xs text-slate-500">Filtreleri değiştirmeyi deneyin</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedRecords.size === results.length}
                    onChange={toggleAllRecords}
                    className="rounded border-slate-300"
                  />
                </div>
                <div className="col-span-1">Satır</div>
                <div className="col-span-2">Veri Türü</div>
                <div className="col-span-2">Durum</div>
                <div className="col-span-4">Veri Önizleme</div>
                <div className="col-span-2 text-right">İşlemler</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {results.map((record) => (
                  <div
                    key={record.id}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-50 transition-colors ${
                      record.status === 'Error' ? 'bg-red-50' :
                      record.status === 'Warning' ? 'bg-amber-50' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedRecords.has(record.id)}
                        onChange={() => toggleRecordSelection(record.id)}
                        className="rounded border-slate-300"
                      />
                    </div>

                    {/* Row Number */}
                    <div className="col-span-1 text-sm text-slate-600">
                      #{record.globalRowIndex || record.rowIndex}
                    </div>

                    {/* Entity Type */}
                    <div className="col-span-2 text-sm text-slate-900">
                      {entityTypeLabels[record.entityType]}
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${getValidationStatusColor(record.status)}`}>
                        {record.status === 'Valid' && <CheckCircle2 className="w-3 h-3" />}
                        {record.status === 'Warning' && <AlertTriangle className="w-3 h-3" />}
                        {record.status === 'Error' && <XCircle className="w-3 h-3" />}
                        {validationStatusLabels[record.status]}
                      </span>
                    </div>

                    {/* Data Preview */}
                    <div className="col-span-4 text-xs text-slate-600 truncate">
                      {Object.entries(record.originalData).slice(0, 3).map(([key, value]) => (
                        <span key={key} className="mr-2">
                          <span className="font-medium">{key}:</span> {String(value)}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      {record.status === 'Error' && (
                        <>
                          <button
                            onClick={() => openEditModal(record)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Düzelt"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSkipRecord(record.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Atla"
                          >
                            <SkipForward className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openEditModal(record)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="Görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
                <div className="text-sm text-slate-500">
                  Toplam {totalCount} kayıt
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>
                  <span className="text-sm text-slate-600">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onBack}
          disabled={isValidating}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Geri
        </button>
        <button
          onClick={handleStartImport}
          disabled={!canProceed || startImport.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {startImport.isPending ? (
            <>
              <Spinner size="sm" />
              Başlatılıyor...
            </>
          ) : (
            <>
              İçe Aktarmaya Başla
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30" onClick={() => setEditingRecord(null)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Kayıt Düzenleme</h3>
                  <p className="text-sm text-slate-500">
                    Satır #{editingRecord.globalRowIndex || editingRecord.rowIndex} - {entityTypeLabels[editingRecord.entityType]}
                  </p>
                </div>
                <button
                  onClick={() => setEditingRecord(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Errors */}
              {editingRecord.errors && editingRecord.errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex gap-2">
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium mb-1">Hatalar:</p>
                      <ul className="list-disc list-inside text-xs">
                        {editingRecord.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {editingRecord.warnings && editingRecord.warnings.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Uyarılar:</p>
                      <ul className="list-disc list-inside text-xs">
                        {editingRecord.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Form */}
              <div className="space-y-4">
                {Object.entries(editedData).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {key}
                    </label>
                    <input
                      type="text"
                      value={String(value || '')}
                      onChange={(e) => setEditedData(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                ))}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                >
                  İptal
                </button>
                {editingRecord.status === 'Error' && (
                  <button
                    onClick={() => handleSkipRecord(editingRecord.id)}
                    disabled={skipRecord.isPending}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
                  >
                    <SkipForward className="w-4 h-4" />
                    Atla
                  </button>
                )}
                <button
                  onClick={handleSaveEdit}
                  disabled={fixRecord.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {fixRecord.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Kaydet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
