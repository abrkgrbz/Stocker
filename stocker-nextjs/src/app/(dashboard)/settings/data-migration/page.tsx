'use client';

/**
 * Data Migration Wizard Page
 * Multi-step wizard for importing data from external ERP/CRM systems
 * - Step 1: Source Selection (Excel, Logo, ETA, etc.)
 * - Step 2: File Upload with chunking
 * - Step 3: Field Mapping with auto-suggestions
 * - Step 4: Validation Preview
 * - Step 5: Import Progress
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeft,
  Database,
  Upload,
  GitMerge,
  CheckCircle2,
  Loader2,
  FileSpreadsheet,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Trash2,
  X,
  Clock,
  XCircle,
  Play,
} from 'lucide-react';
// import { AdminOnly } from '@/components/auth/PermissionGate';
import {
  useMigrationSessions,
  useMigrationSession,
  useDeleteSession,
  useCancelSession,
  sessionStatusLabels,
  getStatusColor,
} from '@/lib/api/hooks/useMigration';
import type { MigrationSessionDto, MigrationSessionStatus } from '@/lib/api/services/migration.service';

// Wizard Step Components
import SourceSelection from './components/SourceSelection';
import FileUpload from './components/FileUpload';
import FieldMapping from './components/FieldMapping';
import ValidationPreview from './components/ValidationPreview';
import ImportProgress from './components/ImportProgress';

// Wizard step type
type WizardStep = 'source' | 'upload' | 'mapping' | 'validation' | 'import';

// Step configuration
const STEPS: { id: WizardStep; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'source', label: 'Kaynak Seçimi', description: 'Veri kaynağı ve veri türleri', icon: Database },
  { id: 'upload', label: 'Dosya Yükleme', description: 'Excel/CSV dosyaları', icon: Upload },
  { id: 'mapping', label: 'Alan Eşleme', description: 'Sütun eşleştirme', icon: GitMerge },
  { id: 'validation', label: 'Doğrulama', description: 'Veri kontrolü', icon: CheckCircle2 },
  { id: 'import', label: 'İçe Aktarma', description: 'Veri aktarımı', icon: Loader2 },
];

// Status icons
const getStatusIcon = (status: MigrationSessionStatus) => {
  switch (status) {
    case 'Completed':
      return CheckCircle2;
    case 'Failed':
      return XCircle;
    case 'Cancelled':
    case 'Expired':
      return X;
    case 'Validating':
    case 'Importing':
      return Loader2;
    default:
      return Clock;
  }
};

export default function DataMigrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get session ID from URL if continuing existing session
  const existingSessionId = searchParams.get('session');

  // Current wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('source');
  const [sessionId, setSessionId] = useState<string | null>(existingSessionId);
  const [showSessionList, setShowSessionList] = useState(!existingSessionId);

  // Fetch existing sessions for the list view
  const { data: sessions, isLoading: sessionsLoading, isError: sessionsError, refetch: refetchSessions } = useMigrationSessions();

  // Fetch current session if we have an ID
  const { data: currentSession, isLoading: sessionLoading } = useMigrationSession(sessionId || '', {
    enabled: !!sessionId,
  });

  // Mutations
  const deleteSession = useDeleteSession();
  const cancelSession = useCancelSession();

  // Determine current step based on session status
  // Only auto-navigate when loading an existing session on page load
  // Don't navigate if we just created a session (currentStep is already set correctly)
  useEffect(() => {
    // Skip if no session or if we're in the middle of creating a new session
    if (!currentSession || !existingSessionId) return;

    // Only update step for sessions that have progressed beyond creation
    switch (currentSession.status) {
      case 'Created':
        // Created status means user should be uploading files
        setCurrentStep('upload');
        break;
      case 'Uploading':
      case 'Uploaded':
        setCurrentStep('upload');
        break;
      case 'Validating':
      case 'Validated':
        // If validated, show validation preview; if validating, show progress
        setCurrentStep('validation');
        break;
      case 'Importing':
      case 'Completed':
      case 'Failed':
        setCurrentStep('import');
        break;
      default:
        setCurrentStep('upload');
    }
  }, [currentSession?.status, existingSessionId]);

  // Handle starting a new wizard
  const handleStartNew = useCallback(() => {
    setSessionId(null);
    setShowSessionList(false);
    setCurrentStep('source');
  }, []);

  // Handle session creation from source selection
  const handleSessionCreated = useCallback((newSessionId: string) => {
    setSessionId(newSessionId);
    setCurrentStep('upload');
    // Update URL without triggering navigation (for bookmarking/refresh support)
    window.history.replaceState(null, '', `/settings/data-migration?session=${newSessionId}`);
  }, []);

  // Handle step navigation
  const handleNextStep = useCallback(() => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  }, [currentStep]);

  const handlePrevStep = useCallback(() => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  }, [currentStep]);

  // Handle continuing an existing session
  const handleContinueSession = useCallback((session: MigrationSessionDto) => {
    // Use sessionId as fallback if id is not set
    const validId = session.id || session.sessionId;
    if (!validId) {
      console.error('Session has no valid ID:', session);
      return;
    }
    setSessionId(validId);
    setShowSessionList(false);

    // Determine step based on session status
    switch (session.status) {
      case 'Created':
      case 'Uploading':
      case 'Uploaded':
        setCurrentStep('upload');
        break;
      case 'Validating':
      case 'Validated':
        setCurrentStep('validation');
        break;
      case 'Importing':
      case 'Completed':
      case 'Failed':
        setCurrentStep('import');
        break;
      default:
        setCurrentStep('upload');
    }

    // Update URL without triggering navigation
    window.history.replaceState(null, '', `/settings/data-migration?session=${validId}`);
  }, []);

  // Handle deleting a session
  const handleDeleteSession = useCallback(async (id: string) => {
    if (!confirm('Bu oturumu silmek istediğinizden emin misiniz?')) return;

    try {
      await deleteSession.mutateAsync(id);
      refetchSessions();
    } catch {
      // Error handled by mutation
    }
  }, [deleteSession, refetchSessions]);

  // Filter active sessions (not completed/cancelled/expired)
  const activeSessions = sessions?.filter(s =>
    !['Completed', 'Failed', 'Cancelled', 'Expired'].includes(s.status)
  ) || [];

  const completedSessions = sessions?.filter(s =>
    ['Completed', 'Failed', 'Cancelled', 'Expired'].includes(s.status)
  ) || [];

  // Get step index for progress indicator
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => showSessionList ? router.back() : setShowSessionList(true)}
                  className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">Veri Aktarımı</h1>
                  <p className="text-sm text-slate-500">
                    {showSessionList
                      ? 'Harici ERP/CRM sistemlerinden veri aktarın'
                      : `Adım ${currentStepIndex + 1}/${STEPS.length}: ${STEPS[currentStepIndex].label}`
                    }
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {showSessionList && (
                  <>
                    <button
                      onClick={() => refetchSessions()}
                      className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Yenile"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleStartNew}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Yeni Aktarım
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {showSessionList ? (
            // Session List View
            <div className="space-y-6">
              {sessionsLoading && !sessionsError ? (
                <div className="flex items-center justify-center py-20">
                  <Spinner size="lg" />
                </div>
              ) : sessionsError || !sessions || sessions.length === 0 ? (
                // Empty State - show when error or no sessions
                <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
                  <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-slate-900 mb-1">Henüz Aktarım Yok</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Harici sistemlerinizden veri aktarmaya başlayın
                  </p>
                  <button
                    onClick={handleStartNew}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    İlk Aktarımı Başlat
                  </button>
                </div>
              ) : (
                <>
                  {/* Active Sessions */}
                  {activeSessions.length > 0 && (
                    <div>
                      <h2 className="text-sm font-medium text-slate-900 mb-3">Devam Eden Aktarımlar</h2>
                      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div className="divide-y divide-slate-100">
                          {activeSessions.map((session) => {
                            const StatusIcon = getStatusIcon(session.status);
                            const sessionKey = session.id || session.sessionId;
                            return (
                              <div
                                key={sessionKey}
                                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">{session.sourceName}</p>
                                    <p className="text-xs text-slate-500">
                                      {session.entities.length} veri türü • {session.totalRecords || 0} kayıt
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(session.status)}`}>
                                    <StatusIcon className={`w-3.5 h-3.5 ${['Validating', 'Importing'].includes(session.status) ? 'animate-spin' : ''}`} />
                                    {sessionStatusLabels[session.status]}
                                  </span>
                                  <button
                                    onClick={() => handleContinueSession(session)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                                  >
                                    Devam Et
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completed Sessions */}
                  {completedSessions.length > 0 && (
                    <div>
                      <h2 className="text-sm font-medium text-slate-900 mb-3">Tamamlanan Aktarımlar</h2>
                      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div className="divide-y divide-slate-100">
                          {completedSessions.slice(0, 10).map((session) => {
                            const StatusIcon = getStatusIcon(session.status);
                            const sessionKey = session.id || session.sessionId;
                            return (
                              <div
                                key={sessionKey}
                                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${
                                    session.status === 'Completed' ? 'bg-emerald-50' :
                                    session.status === 'Failed' ? 'bg-red-50' : 'bg-slate-50'
                                  }`}>
                                    <FileSpreadsheet className={`w-5 h-5 ${
                                      session.status === 'Completed' ? 'text-emerald-600' :
                                      session.status === 'Failed' ? 'text-red-600' : 'text-slate-400'
                                    }`} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">{session.sourceName}</p>
                                    <p className="text-xs text-slate-500">
                                      {session.importedRecords} / {session.totalRecords} kayıt aktarıldı
                                      {session.completedAt && (
                                        <> • {new Date(session.completedAt).toLocaleDateString('tr-TR')}</>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(session.status)}`}>
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    {sessionStatusLabels[session.status]}
                                  </span>
                                  <button
                                    onClick={() => handleContinueSession(session)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                    title="Detayları Görüntüle"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSession(sessionKey || '')}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Sil"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            // Wizard View
            <div className="space-y-6">
              {/* Step Progress */}
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  {STEPS.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = index < currentStepIndex;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.id} className="flex items-center flex-1">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                              isActive
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : isCompleted
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <StepIcon className={`w-5 h-5 ${isActive && step.id === 'import' ? 'animate-spin' : ''}`} />
                            )}
                          </div>
                          <div className="hidden md:block">
                            <p className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                              {step.label}
                            </p>
                            <p className="text-xs text-slate-400">{step.description}</p>
                          </div>
                        </div>
                        {index < STEPS.length - 1 && (
                          <div
                            className={`flex-1 h-0.5 mx-4 ${
                              isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step Content */}
              <div className="bg-white border border-slate-200 rounded-lg">
                {sessionLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <>
                    {currentStep === 'source' && (
                      <SourceSelection
                        onSessionCreated={handleSessionCreated}
                        onCancel={() => setShowSessionList(true)}
                      />
                    )}

                    {currentStep === 'upload' && sessionId && (
                      <FileUpload
                        sessionId={sessionId}
                        session={currentSession}
                        onNext={handleNextStep}
                        onBack={handlePrevStep}
                      />
                    )}

                    {currentStep === 'mapping' && sessionId && (
                      <FieldMapping
                        sessionId={sessionId}
                        session={currentSession}
                        onNext={handleNextStep}
                        onBack={handlePrevStep}
                      />
                    )}

                    {currentStep === 'validation' && sessionId && (
                      <ValidationPreview
                        sessionId={sessionId}
                        session={currentSession}
                        onNext={handleNextStep}
                        onBack={handlePrevStep}
                      />
                    )}

                    {currentStep === 'import' && sessionId && (
                      <ImportProgress
                        sessionId={sessionId}
                        session={currentSession}
                        onComplete={() => setShowSessionList(true)}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
