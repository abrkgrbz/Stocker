'use client';

/**
 * Audit Logs Page
 * Monochrome Design System - Professional Slate Palette
 * - Compact stat cards with real-time updates
 * - Dense data table with filtering
 * - Slide-over detail panel
 */

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeft,
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  Shield,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Globe,
  ChevronRight,
  X,
  Activity,
  Users,
  Ban,
} from 'lucide-react';
import { AdminOnly } from '@/components/auth/PermissionGate';
import { useAuditLogs, useAuditLogStatistics, formatTimeAgo, getRiskLevelColor, getRiskLevelLabel, getEventLabel } from '@/lib/api/hooks/useAuditLogs';
import type { AuditLogFilters, AuditLogListItem } from '@/lib/api/services';

// Event type icons
const getEventIcon = (event: string) => {
  const eventLower = event.toLowerCase();
  if (eventLower.includes('login') && eventLower.includes('success')) return CheckCircle2;
  if (eventLower.includes('login') && eventLower.includes('fail')) return XCircle;
  if (eventLower.includes('logout')) return User;
  if (eventLower.includes('password')) return Shield;
  if (eventLower.includes('create') || eventLower.includes('add')) return CheckCircle2;
  if (eventLower.includes('update') || eventLower.includes('modify')) return RefreshCw;
  if (eventLower.includes('delete') || eventLower.includes('remove')) return XCircle;
  if (eventLower.includes('block') || eventLower.includes('ban')) return Ban;
  return Activity;
};

// Event type badge color - monochrome variations
const getEventBadgeStyle = (event: string) => {
  const eventLower = event.toLowerCase();
  if (eventLower.includes('fail') || eventLower.includes('error')) return 'bg-slate-900 text-white';
  if (eventLower.includes('success')) return 'bg-slate-200 text-slate-700';
  if (eventLower.includes('warning') || eventLower.includes('block')) return 'bg-slate-300 text-slate-800';
  return 'bg-slate-100 text-slate-600';
};

// Risk level colors - monochrome
const getMonochromeRiskColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'bg-slate-900 text-white';
    case 'medium':
      return 'bg-slate-400 text-white';
    case 'low':
      return 'bg-slate-200 text-slate-700';
    default:
      return 'bg-slate-100 text-slate-500';
  }
};

// Date filter options
const dateFilters = [
  { value: 'today', label: 'Bugün' },
  { value: 'yesterday', label: 'Dün' },
  { value: 'last7days', label: 'Son 7 Gün' },
  { value: 'last30days', label: 'Son 30 Gün' },
  { value: 'thisMonth', label: 'Bu Ay' },
  { value: 'custom', label: 'Özel Tarih' },
];

// Calculate date range from filter
const getDateRange = (filter: string): { fromDate?: string; toDate?: string } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case 'today':
      return { fromDate: today.toISOString(), toDate: now.toISOString() };
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { fromDate: yesterday.toISOString(), toDate: today.toISOString() };
    }
    case 'last7days': {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { fromDate: weekAgo.toISOString(), toDate: now.toISOString() };
    }
    case 'last30days': {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return { fromDate: monthAgo.toISOString(), toDate: now.toISOString() };
    }
    case 'thisMonth': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { fromDate: monthStart.toISOString(), toDate: now.toISOString() };
    }
    default:
      return {};
  }
};

export default function AuditLogsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('last7days');
  const [selectedLog, setSelectedLog] = useState<AuditLogListItem | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Calculate date range
  const dateRange = useMemo(() => getDateRange(dateFilter), [dateFilter]);

  // Build filters
  const filters: AuditLogFilters = useMemo(() => ({
    ...dateRange,
    searchTerm: searchTerm || undefined,
    pageNumber: page,
    pageSize,
  }), [dateRange, searchTerm, page]);

  // Fetch data
  const { data: logsData, isLoading, refetch, isRefetching } = useAuditLogs(filters);
  const { data: statistics, isLoading: statsLoading } = useAuditLogStatistics(
    dateRange.fromDate,
    dateRange.toDate
  );

  const logs = logsData?.logs || [];
  const totalCount = logsData?.totalCount || 0;
  const totalPages = logsData?.totalPages || 1;

  return (
    <AdminOnly
      fallback={
        <div className="min-h-screen bg-slate-50 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Yetkisiz Erişim</h3>
              <p className="text-sm text-slate-500">
                Denetim günlüklerine erişim yetkiniz bulunmamaktadır.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Denetim Günlükleri</h1>
                <p className="text-sm text-slate-500">Sistem aktivitelerini izleyin</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                disabled={isRefetching}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Yenile"
              >
                <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="CSV İndir"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Dışa Aktar</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Toplam Olay</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-slate-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                {statsLoading ? '...' : (statistics?.totalEvents ?? 0).toLocaleString('tr-TR')}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Başarısız Giriş</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-slate-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                {statsLoading ? '...' : (statistics?.failedLogins ?? 0).toLocaleString('tr-TR')}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Benzersiz Kullanıcı</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-slate-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                {statsLoading ? '...' : (statistics?.uniqueUsers ?? 0).toLocaleString('tr-TR')}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Engellenen</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Ban className="w-4 h-4 text-slate-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                {statsLoading ? '...' : (statistics?.blockedEvents ?? 0).toLocaleString('tr-TR')}
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ara... (kullanıcı, IP, olay)"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {dateFilters.map((df) => (
                    <option key={df.value} value={df.value}>
                      {df.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-slate-900 mb-1">Kayıt Bulunamadı</h3>
                <p className="text-xs text-slate-500">Seçilen kriterlere uygun denetim kaydı yok</p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <div className="col-span-3">Olay</div>
                  <div className="col-span-2">Kullanıcı</div>
                  <div className="col-span-2">IP Adresi</div>
                  <div className="col-span-2">Risk</div>
                  <div className="col-span-2">Zaman</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const IconComponent = getEventIcon(log.event);
                    return (
                      <div
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        {/* Event */}
                        <div className="md:col-span-3 flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getEventBadgeStyle(log.event)}`}>
                            {getEventLabel(log.event)}
                          </span>
                          {log.blocked && (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-slate-900 text-white rounded">
                              Engellendi
                            </span>
                          )}
                        </div>

                        {/* User */}
                        <div className="md:col-span-2 flex items-center gap-2 text-sm text-slate-600">
                          <User className="w-3 h-3 text-slate-400 md:hidden" />
                          <span className="truncate">{log.email || '-'}</span>
                        </div>

                        {/* IP */}
                        <div className="md:col-span-2 flex items-center gap-2 text-sm text-slate-500 font-mono">
                          <Globe className="w-3 h-3 text-slate-400 md:hidden" />
                          {log.ipAddress || '-'}
                        </div>

                        {/* Risk Level */}
                        <div className="md:col-span-2 flex items-center gap-2">
                          {log.riskLevel ? (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getMonochromeRiskColor(log.riskLevel)}`}>
                              {getRiskLevelLabel(log.riskLevel)}
                              {log.riskScore !== undefined && ` (${log.riskScore})`}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </div>

                        {/* Time */}
                        <div className="md:col-span-2 flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400 md:hidden" />
                          {log.timeAgo || formatTimeAgo(log.timestamp)}
                        </div>

                        {/* Arrow */}
                        <div className="md:col-span-1 flex items-center justify-end">
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
                  <div className="text-sm text-slate-500">
                    Toplam {totalCount.toLocaleString('tr-TR')} kayıt
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Önceki
                    </button>
                    <span className="text-sm text-slate-600">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Detail Slide-Over */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 transition-opacity"
              onClick={() => setSelectedLog(null)}
            />

            {/* Panel */}
            <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">Olay Detayı</h2>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Event Info */}
                  <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${getEventBadgeStyle(selectedLog.event)}`}>
                      {(() => {
                        const IconComponent = getEventIcon(selectedLog.event);
                        return <IconComponent className="w-4 h-4" />;
                      })()}
                      <span className="text-sm font-medium">{getEventLabel(selectedLog.event)}</span>
                    </div>
                    {selectedLog.blocked && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-slate-900 text-white rounded">
                        Engellendi
                      </span>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kullanıcı</label>
                        <p className="mt-1 text-sm text-slate-900">{selectedLog.email || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tenant</label>
                        <p className="mt-1 text-sm text-slate-900">{selectedLog.tenantCode || '-'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">IP Adresi</label>
                        <p className="mt-1 text-sm text-slate-900 font-mono">{selectedLog.ipAddress || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Risk Seviyesi</label>
                        <div className="mt-1">
                          {selectedLog.riskLevel ? (
                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${getMonochromeRiskColor(selectedLog.riskLevel)}`}>
                              {getRiskLevelLabel(selectedLog.riskLevel)}
                              {selectedLog.riskScore !== undefined && ` (${selectedLog.riskScore})`}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-500">-</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Zaman</label>
                      <p className="mt-1 text-sm text-slate-900">
                        {new Date(selectedLog.timestamp).toLocaleString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-slate-500">{selectedLog.timeAgo || formatTimeAgo(selectedLog.timestamp)}</p>
                    </div>
                  </div>

                  {/* Risk Score Visualization */}
                  {selectedLog.riskScore !== undefined && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Risk Skoru</span>
                        <span className="text-lg font-bold text-slate-900">{selectedLog.riskScore}/100</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all bg-slate-900"
                          style={{ width: `${selectedLog.riskScore}%` }}
                        />
                      </div>
                    </div>
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
