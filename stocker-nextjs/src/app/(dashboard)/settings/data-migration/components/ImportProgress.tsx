'use client';

/**
 * Import Progress Step
 * Shows real-time progress of the import process
 */

import { useEffect, useState } from 'react';
import { Spinner } from '@/components/primitives';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
  Download,
  Home,
  AlertCircle,
  Clock,
  TrendingUp,
  Package,
  Users,
  Building2,
} from 'lucide-react';
import {
  useMigrationProgress,
  useMigrationSession,
  useMigrationStatistics,
  entityTypeLabels,
  sessionStatusLabels,
  getStatusColor,
} from '@/lib/api/hooks/useMigration';
import type {
  MigrationSessionDto,
  MigrationEntityType,
} from '@/lib/api/services/migration.service';

interface ImportProgressProps {
  sessionId: string;
  session: MigrationSessionDto | undefined;
  onComplete: () => void;
}

// Entity icons
const entityIcons: Record<MigrationEntityType, React.ComponentType<{ className?: string }>> = {
  Customer: Users,
  Supplier: Building2,
  Product: Package,
  Category: FileSpreadsheet,
  Brand: FileSpreadsheet,
  Warehouse: FileSpreadsheet,
  Unit: FileSpreadsheet,
  Contact: Users,
  Address: FileSpreadsheet,
  BankAccount: FileSpreadsheet,
  OpeningBalance: TrendingUp,
  StockMovement: TrendingUp,
  PriceList: FileSpreadsheet,
};

export default function ImportProgress({ sessionId, session, onComplete }: ImportProgressProps) {
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Fetch progress with polling
  const { data: progress, refetch: refetchProgress } = useMigrationProgress(sessionId, {
    enabled: !!sessionId && session?.status === 'Importing',
    refetchInterval: 1000, // Poll every second during import
  });

  // Re-fetch session to get final status
  const { data: currentSession, refetch: refetchSession } = useMigrationSession(sessionId, {
    enabled: !!sessionId,
    refetchInterval: session?.status === 'Importing' ? 2000 : undefined,
  });

  // Fetch statistics
  const { data: statistics } = useMigrationStatistics(sessionId, {
    enabled: !!sessionId,
  });

  // Update elapsed time
  useEffect(() => {
    if (currentSession?.status === 'Importing') {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentSession?.status, startTime]);

  // Format elapsed time
  const formatElapsedTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}dk ${remainingSeconds}sn`;
    }
    return `${remainingSeconds}sn`;
  };

  // Calculate progress percentage
  const progressPercent = progress?.totalRecords
    ? Math.round((progress.processedRecords / progress.totalRecords) * 100)
    : 0;

  // Get current status
  const isImporting = currentSession?.status === 'Importing';
  const isCompleted = currentSession?.status === 'Completed';
  const isFailed = currentSession?.status === 'Failed';

  // Estimated time remaining
  const estimatedTimeRemaining = progress?.estimatedTimeRemaining
    ? `~${Math.ceil(progress.estimatedTimeRemaining / 60)} dakika kaldı`
    : null;

  return (
    <div className="p-6 space-y-6">
      {/* Status Header */}
      <div className={`rounded-lg p-6 ${
        isCompleted ? 'bg-emerald-50 border border-emerald-200' :
        isFailed ? 'bg-red-50 border border-red-200' :
        'bg-blue-50 border border-blue-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isCompleted ? 'bg-emerald-100' :
            isFailed ? 'bg-red-100' :
            'bg-blue-100'
          }`}>
            {isCompleted ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            ) : isFailed ? (
              <XCircle className="w-8 h-8 text-red-600" />
            ) : (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            )}
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-semibold ${
              isCompleted ? 'text-emerald-900' :
              isFailed ? 'text-red-900' :
              'text-blue-900'
            }`}>
              {isCompleted ? 'Aktarım Tamamlandı!' :
               isFailed ? 'Aktarım Başarısız' :
               'Aktarım Devam Ediyor...'}
            </h2>
            <p className={`text-sm ${
              isCompleted ? 'text-emerald-700' :
              isFailed ? 'text-red-700' :
              'text-blue-700'
            }`}>
              {isCompleted
                ? `${currentSession?.importedRecords?.toLocaleString('tr-TR')} kayıt başarıyla aktarıldı`
                : isFailed
                  ? currentSession?.errorMessage || 'Bir hata oluştu'
                  : `${progress?.processedRecords || 0} / ${progress?.totalRecords || 0} kayıt işlendi`
              }
            </p>
          </div>
          {isImporting && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-blue-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{formatElapsedTime(elapsedTime)}</span>
              </div>
              {estimatedTimeRemaining && (
                <p className="text-xs text-blue-500 mt-1">{estimatedTimeRemaining}</p>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isImporting && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-blue-700 mb-2">
              <span>İlerleme</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Current Entity */}
      {isImporting && progress?.currentEntity && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              {(() => {
                const Icon = entityIcons[progress.currentEntity as MigrationEntityType] || FileSpreadsheet;
                return <Icon className="w-5 h-5 text-blue-600" />;
              })()}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                {entityTypeLabels[progress.currentEntity]} aktarılıyor...
              </p>
              <p className="text-xs text-slate-500">
                İşleniyor: {progress.processedRecords} / {progress.totalRecords}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Summary */}
      {(isCompleted || isFailed) && currentSession && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-slate-100 rounded">
                <FileSpreadsheet className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase">Toplam</span>
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              {currentSession.totalRecords.toLocaleString('tr-TR')}
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-emerald-100 rounded">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-emerald-600 uppercase">Aktarıldı</span>
            </div>
            <p className="text-2xl font-semibold text-emerald-700">
              {currentSession.importedRecords.toLocaleString('tr-TR')}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-amber-100 rounded">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-amber-600 uppercase">Atlandı</span>
            </div>
            <p className="text-2xl font-semibold text-amber-700">
              {currentSession.skippedRecords.toLocaleString('tr-TR')}
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
              {currentSession.errorRecords.toLocaleString('tr-TR')}
            </p>
          </div>
        </div>
      )}

      {/* Per-Entity Statistics */}
      {(isCompleted || isFailed) && statistics?.byEntity && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-medium text-slate-900">Veri Türü Bazında Sonuçlar</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {Object.entries(statistics.byEntity).map(([entityType, stats]) => {
              const Icon = entityIcons[entityType as MigrationEntityType] || FileSpreadsheet;
              const successRate = stats.total > 0
                ? Math.round(((stats.valid + stats.warning) / stats.total) * 100)
                : 0;

              return (
                <div key={entityType} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {entityTypeLabels[entityType as MigrationEntityType]}
                      </p>
                      <p className="text-xs text-slate-500">
                        {stats.total} kayıt
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-emerald-600">{stats.valid} geçerli</span>
                        {stats.warning > 0 && (
                          <span className="text-amber-600">{stats.warning} uyarı</span>
                        )}
                        {stats.error > 0 && (
                          <span className="text-red-600">{stats.error} hata</span>
                        )}
                      </div>
                    </div>
                    <div className="w-24">
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-900 w-12 text-right">
                      {successRate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Details */}
      {isFailed && currentSession?.errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">Hata Detayı</p>
              <p className="text-red-700">{currentSession.errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        {isImporting ? (
          <p className="text-sm text-slate-500">
            Aktarım devam ederken sayfayı kapatmayın
          </p>
        ) : (
          <div className="flex items-center gap-2">
            {isCompleted && (
              <button
                onClick={() => {
                  // Download report functionality would go here
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
                Rapor İndir
              </button>
            )}
          </div>
        )}

        {(isCompleted || isFailed) && (
          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Aktarımlarıma Dön
          </button>
        )}
      </div>
    </div>
  );
}
