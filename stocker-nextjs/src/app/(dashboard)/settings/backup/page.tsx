'use client';

/**
 * Backup & Restore Page
 * Corporate Professional Design - Monochrome Palette
 * - Statistics cards showing backup status
 * - Backup list with filtering, search, and download
 * - Create backup modal
 * - Restore confirmation modal
 */

import { useState, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeft,
  CloudUpload,
  Download,
  RefreshCw,
  Trash2,
  Database,
  FileArchive,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  RotateCcw,
  HardDrive,
  Shield,
  Calendar,
  X,
  ChevronRight,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Timer,
} from 'lucide-react';
import BackupSchedules from './BackupSchedules';
import { AdminOnly } from '@/components/auth/PermissionGate';
import {
  useBackups,
  useBackupStatistics,
  useCreateBackup,
  useDeleteBackup,
  useRestoreBackup,
  useBackupDownload,
  formatBytes,
  getStatusColor,
  getStatusLabel,
  getBackupTypeLabel,
} from '@/lib/api/hooks/useBackup';
import type { BackupDto, BackupFilters, CreateBackupRequest } from '@/lib/api/services/backup.service';

// Status icons
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Completed':
      return CheckCircle2;
    case 'Pending':
    case 'InProgress':
      return Clock;
    case 'Failed':
      return XCircle;
    case 'Deleted':
      return Trash2;
    default:
      return FileArchive;
  }
};

export default function BackupPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'backups' | 'schedules'>('backups');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState<BackupDto | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<BackupDto | null>(null);
  const [selectedBackup, setSelectedBackup] = useState<BackupDto | null>(null);
  const pageSize = 10;

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Compute filters with useMemo
  const filters: BackupFilters = useMemo(() => ({
    pageNumber: page,
    pageSize,
    sortDescending: true,
    search: searchQuery || undefined,
    status: statusFilter || undefined,
    backupType: typeFilter || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  }), [page, pageSize, searchQuery, statusFilter, typeFilter, fromDate, toDate]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || statusFilter || typeFilter || fromDate || toDate;

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setTypeFilter('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  // Fetch data
  const { data: backupsData, isLoading, refetch, isRefetching } = useBackups(filters);
  const { data: statistics, isLoading: statsLoading } = useBackupStatistics();

  // Mutations
  const createBackup = useCreateBackup();
  const deleteBackup = useDeleteBackup();
  const restoreBackup = useRestoreBackup();
  const downloadBackup = useBackupDownload();

  const backups = backupsData?.items || [];
  const totalCount = backupsData?.totalCount || 0;
  const totalPages = backupsData?.totalPages || 1;

  // Create backup form state
  const [createForm, setCreateForm] = useState<CreateBackupRequest>({
    backupName: '',
    backupType: 'Full',
    includeDatabase: true,
    includeFiles: true,
    includeConfiguration: true,
    compress: true,
    encrypt: true,
    description: '',
  });

  const handleCreateBackup = async () => {
    if (!createForm.backupName.trim()) return;

    try {
      await createBackup.mutateAsync(createForm);
      setShowCreateModal(false);
      setCreateForm({
        backupName: '',
        backupType: 'Full',
        includeDatabase: true,
        includeFiles: true,
        includeConfiguration: true,
        compress: true,
        encrypt: true,
        description: '',
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleRestoreBackup = async () => {
    if (!showRestoreModal) return;

    try {
      await restoreBackup.mutateAsync({ id: showRestoreModal.id });
      setShowRestoreModal(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleDeleteBackup = async () => {
    if (!showDeleteModal) return;

    try {
      await deleteBackup.mutateAsync(showDeleteModal.id);
      setShowDeleteModal(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleDownload = async (backup: BackupDto) => {
    try {
      const result = await downloadBackup.mutateAsync({ id: backup.id });
      // Open download URL in new tab
      window.open(result.downloadUrl, '_blank');
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <AdminOnly
      fallback={
        <div className="min-h-screen bg-slate-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Yetkisiz Erişim</h3>
              <p className="text-sm text-slate-500">
                Yedekleme işlemlerine erişim yetkiniz bulunmamaktadır.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-slate-50">
        {/* Minimal Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">Yedekleme ve Geri Yükleme</h1>
                  <p className="text-sm text-slate-500">Veri yedekleme ve kurtarma işlemleri</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  title="Yenile"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Yeni Yedek
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Toplam Yedek</span>
                <FileArchive className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                {statsLoading ? '...' : (statistics?.totalBackups ?? 0)}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tamamlanan</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                {statsLoading ? '...' : (statistics?.completedBackups ?? 0)}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Toplam Boyut</span>
                <HardDrive className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                {statsLoading ? '...' : (statistics?.totalSizeFormatted || formatBytes(statistics?.totalSizeBytes ?? 0))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Son Yedek</span>
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-sm font-medium text-slate-900">
                {statsLoading ? '...' : (statistics?.lastBackupDate
                  ? new Date(statistics.lastBackupDate).toLocaleDateString('tr-TR')
                  : 'Henüz yok')}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('backups')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'backups'
                  ? 'text-slate-900 border-slate-900'
                  : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <FileArchive className="w-4 h-4" />
              Yedekler
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'schedules'
                  ? 'text-slate-900 border-slate-900'
                  : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Timer className="w-4 h-4" />
              Zamanlamalar
            </button>
          </div>

          {activeTab === 'schedules' && <BackupSchedules />}

          {activeTab === 'backups' && (
          <>
          {/* Search and Filters */}
          <div className="bg-white border border-slate-200 rounded-lg mb-4">
            <div className="p-4">
              <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Yedek adı veya açıklama ara..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                    showFilters || hasActiveFilters
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filtreler
                  {hasActiveFilters && (
                    <span className="flex items-center justify-center w-5 h-5 bg-white text-slate-900 text-xs font-bold rounded-full">
                      {[statusFilter, typeFilter, fromDate, toDate].filter(Boolean).length}
                    </span>
                  )}
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Temizle
                  </button>
                )}
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Durum
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="">Tümü</option>
                      <option value="Completed">Tamamlandı</option>
                      <option value="Pending">Bekliyor</option>
                      <option value="InProgress">Devam Ediyor</option>
                      <option value="Failed">Başarısız</option>
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Tür
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => {
                        setTypeFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="">Tümü</option>
                      <option value="Full">Tam Yedek</option>
                      <option value="Incremental">Artımlı</option>
                      <option value="Differential">Fark</option>
                    </select>
                  </div>

                  {/* From Date */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Başlangıç Tarihi
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => {
                        setFromDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  {/* To Date */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Bitiş Tarihi
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => {
                        setToDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Active Filters Indicators */}
            {hasActiveFilters && !showFilters && (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-t border-slate-200">
                <span className="text-xs text-slate-500">Aktif filtreler:</span>
                {statusFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded-full">
                    Durum: {getStatusLabel(statusFilter)}
                    <button onClick={() => setStatusFilter('')} className="hover:text-slate-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {typeFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded-full">
                    Tür: {getBackupTypeLabel(typeFilter)}
                    <button onClick={() => setTypeFilter('')} className="hover:text-slate-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {fromDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded-full">
                    Başlangıç: {fromDate}
                    <button onClick={() => setFromDate('')} className="hover:text-slate-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {toDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded-full">
                    Bitiş: {toDate}
                    <button onClick={() => setToDate('')} className="hover:text-slate-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Backups Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-20">
                <CloudUpload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-slate-900 mb-1">
                  {hasActiveFilters ? 'Sonuç Bulunamadı' : 'Yedek Bulunamadı'}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  {hasActiveFilters
                    ? 'Arama kriterlerinize uygun yedek bulunamadı'
                    : 'Henüz bir yedekleme oluşturmadınız'}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 text-slate-700 border border-slate-300 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Filtreleri Temizle
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    İlk Yedeği Oluştur
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <div className="col-span-3">Yedek Adı</div>
                  <div className="col-span-2">Tür</div>
                  <div className="col-span-2">Durum</div>
                  <div className="col-span-2">Boyut</div>
                  <div className="col-span-2">Tarih</div>
                  <div className="col-span-1">İşlemler</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-100">
                  {backups.map((backup) => {
                    const StatusIcon = getStatusIcon(backup.status);
                    return (
                      <div
                        key={backup.id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        {/* Name */}
                        <div className="md:col-span-3">
                          <div className="flex items-center gap-2">
                            <FileArchive className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-slate-900 truncate">{backup.backupName}</p>
                              <p className="text-xs text-slate-500 truncate">{backup.createdBy}</p>
                            </div>
                          </div>
                        </div>

                        {/* Type */}
                        <div className="md:col-span-2 flex items-center">
                          <div className="flex items-center gap-1.5">
                            {backup.includesDatabase && <span title="Veritabanı"><Database className="w-3.5 h-3.5 text-slate-400" /></span>}
                            {backup.includesFiles && <span title="Dosyalar"><FileArchive className="w-3.5 h-3.5 text-slate-400" /></span>}
                            {backup.includesConfiguration && <span title="Ayarlar"><Settings className="w-3.5 h-3.5 text-slate-400" /></span>}
                            <span className="ml-1 text-sm text-slate-600">{getBackupTypeLabel(backup.backupType)}</span>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="md:col-span-2 flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${
                            backup.status === 'Completed' ? 'text-emerald-500' :
                            backup.status === 'Failed' ? 'text-red-500' :
                            backup.status === 'InProgress' ? 'text-blue-500' :
                            'text-amber-500'
                          }`} />
                          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getStatusColor(backup.status)}`}>
                            {getStatusLabel(backup.status)}
                          </span>
                        </div>

                        {/* Size */}
                        <div className="md:col-span-2 flex items-center">
                          <span className="text-sm text-slate-600">
                            {backup.sizeFormatted || formatBytes(backup.sizeInBytes)}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="md:col-span-2 flex items-center">
                          <span className="text-sm text-slate-500">
                            {new Date(backup.createdAt).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="md:col-span-1 flex items-center justify-end gap-1">
                          {backup.status === 'Completed' && (
                            <button
                              onClick={() => handleDownload(backup)}
                              disabled={downloadBackup.isPending}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50"
                              title="İndir"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          {backup.isRestorable && (
                            <button
                              onClick={() => setShowRestoreModal(backup)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Geri Yükle"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                          {backup.status === 'Completed' && (
                            <button
                              onClick={() => setShowDeleteModal(backup)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedBackup(backup)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Detay"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
                  <div className="text-sm text-slate-500">
                    Toplam {totalCount} yedek
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Önceki
                    </button>
                    <span className="text-sm text-slate-600">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          </>
          )}
        </div>

        {/* Create Backup Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/30" onClick={() => setShowCreateModal(false)} />
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Yeni Yedek Oluştur</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Backup Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Yedek Adı *
                    </label>
                    <input
                      type="text"
                      value={createForm.backupName}
                      onChange={(e) => setCreateForm({ ...createForm, backupName: e.target.value })}
                      placeholder="Örn: Günlük Yedek 27.12.2024"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>

                  {/* Backup Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Yedek Türü
                    </label>
                    <select
                      value={createForm.backupType}
                      onChange={(e) => setCreateForm({ ...createForm, backupType: e.target.value as 'Full' | 'Incremental' | 'Differential' })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="Full">Tam Yedek</option>
                      <option value="Incremental">Artımlı</option>
                      <option value="Differential">Fark</option>
                    </select>
                  </div>

                  {/* Include Options */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Dahil Edilecekler
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={createForm.includeDatabase}
                          onChange={(e) => setCreateForm({ ...createForm, includeDatabase: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                        <Database className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700">Veritabanı</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={createForm.includeFiles}
                          onChange={(e) => setCreateForm({ ...createForm, includeFiles: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                        <FileArchive className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700">Dosyalar</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={createForm.includeConfiguration}
                          onChange={(e) => setCreateForm({ ...createForm, includeConfiguration: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700">Ayarlar</span>
                      </label>
                    </div>
                  </div>

                  {/* Security Options */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Güvenlik
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={createForm.compress}
                          onChange={(e) => setCreateForm({ ...createForm, compress: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                        <span className="text-sm text-slate-700">Sıkıştır</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={createForm.encrypt}
                          onChange={(e) => setCreateForm({ ...createForm, encrypt: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                        <Shield className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700">Şifrele</span>
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      placeholder="İsteğe bağlı açıklama..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleCreateBackup}
                    disabled={!createForm.backupName.trim() || createBackup.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {createBackup.isPending ? (
                      <>
                        <Spinner size="sm" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <CloudUpload className="w-4 h-4" />
                        Yedek Oluştur
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restore Confirmation Modal */}
        {showRestoreModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/30" onClick={() => setShowRestoreModal(null)} />
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Geri Yüklemeyi Onayla</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      <strong>{showRestoreModal.backupName}</strong> yedeğinden geri yükleme yapmak istediğinizden emin misiniz?
                    </p>
                    <p className="mt-2 text-sm text-red-600">
                      Bu işlem mevcut verilerin üzerine yazacaktır!
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setShowRestoreModal(null)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleRestoreBackup}
                    disabled={restoreBackup.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {restoreBackup.isPending ? (
                      <>
                        <Spinner size="sm" />
                        Geri Yükleniyor...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Geri Yükle
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/30" onClick={() => setShowDeleteModal(null)} />
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-red-100 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Yedeği Sil</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      <strong>{showDeleteModal.backupName}</strong> yedeğini silmek istediğinizden emin misiniz?
                    </p>
                    <p className="mt-2 text-sm text-red-600">
                      Bu işlem geri alınamaz!
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleDeleteBackup}
                    disabled={deleteBackup.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleteBackup.isPending ? (
                      <>
                        <Spinner size="sm" />
                        Siliniyor...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Sil
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Slide-Over */}
        {selectedBackup && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div
              className="absolute inset-0 bg-black/30 transition-opacity"
              onClick={() => setSelectedBackup(null)}
            />
            <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">Yedek Detayı</h2>
                  <button
                    onClick={() => setSelectedBackup(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {(() => {
                      const StatusIcon = getStatusIcon(selectedBackup.status);
                      return <StatusIcon className={`w-5 h-5 ${
                        selectedBackup.status === 'Completed' ? 'text-emerald-500' :
                        selectedBackup.status === 'Failed' ? 'text-red-500' :
                        'text-amber-500'
                      }`} />;
                    })()}
                    <span className={`px-3 py-1 text-sm font-medium rounded border ${getStatusColor(selectedBackup.status)}`}>
                      {getStatusLabel(selectedBackup.status)}
                    </span>
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Yedek Adı</label>
                      <p className="mt-1 text-sm text-slate-900 font-medium">{selectedBackup.backupName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tür</label>
                        <p className="mt-1 text-sm text-slate-900">{getBackupTypeLabel(selectedBackup.backupType)}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Boyut</label>
                        <p className="mt-1 text-sm text-slate-900">{selectedBackup.sizeFormatted || formatBytes(selectedBackup.sizeInBytes)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Oluşturulma</label>
                        <p className="mt-1 text-sm text-slate-900">
                          {new Date(selectedBackup.createdAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Oluşturan</label>
                        <p className="mt-1 text-sm text-slate-900">{selectedBackup.createdBy}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">İçerik</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Database className={`w-4 h-4 ${selectedBackup.includesDatabase ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className={`text-sm ${selectedBackup.includesDatabase ? 'text-slate-700' : 'text-slate-400'}`}>
                          Veritabanı {selectedBackup.includesDatabase ? 'dahil' : 'dahil değil'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileArchive className={`w-4 h-4 ${selectedBackup.includesFiles ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className={`text-sm ${selectedBackup.includesFiles ? 'text-slate-700' : 'text-slate-400'}`}>
                          Dosyalar {selectedBackup.includesFiles ? 'dahil' : 'dahil değil'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Settings className={`w-4 h-4 ${selectedBackup.includesConfiguration ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className={`text-sm ${selectedBackup.includesConfiguration ? 'text-slate-700' : 'text-slate-400'}`}>
                          Ayarlar {selectedBackup.includesConfiguration ? 'dahil' : 'dahil değil'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Güvenlik</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${selectedBackup.isCompressed ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className={`text-sm ${selectedBackup.isCompressed ? 'text-slate-700' : 'text-slate-400'}`}>
                          {selectedBackup.isCompressed ? 'Sıkıştırılmış' : 'Sıkıştırılmamış'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className={`w-4 h-4 ${selectedBackup.isEncrypted ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className={`text-sm ${selectedBackup.isEncrypted ? 'text-slate-700' : 'text-slate-400'}`}>
                          {selectedBackup.isEncrypted ? 'Şifrelenmiş' : 'Şifrelenmemiş'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedBackup.description && (
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Açıklama</label>
                      <p className="mt-1 text-sm text-slate-600">{selectedBackup.description}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-200">
                  {selectedBackup.status === 'Completed' && (
                    <button
                      onClick={() => handleDownload(selectedBackup)}
                      disabled={downloadBackup.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      İndir
                    </button>
                  )}
                  {selectedBackup.isRestorable && (
                    <button
                      onClick={() => {
                        setSelectedBackup(null);
                        setShowRestoreModal(selectedBackup);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Geri Yükle
                    </button>
                  )}
                  {selectedBackup.status === 'Completed' && (
                    <button
                      onClick={() => {
                        setSelectedBackup(null);
                        setShowDeleteModal(selectedBackup);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Sil
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminOnly>
  );
}
