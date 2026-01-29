
'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button, Spinner } from '@/components/primitives';

interface SalesFormPageLayoutProps {
    /** Page title displayed in header */
    title: string;
    /** Subtitle/description displayed below title */
    subtitle: string;
    /** Path to navigate when cancel is clicked */
    cancelPath: string;
    /** Loading state for save button */
    loading?: boolean;
    /** Callback when save button is clicked */
    onSave: () => void;
    /** Form content to render */
    children: React.ReactNode;
    /** Optional: Custom content to render after title (e.g., status tag) */
    titleExtra?: React.ReactNode;
    /** Optional: Show loading spinner for data fetch */
    isDataLoading?: boolean;
    /** Optional: Error state for data fetch */
    dataError?: boolean;
    /** Optional: Error message for data fetch */
    errorMessage?: string;
    /** Optional: Error description for data fetch */
    errorDescription?: string;
    /** Optional: Extra actions to render before cancel/save buttons (e.g., delete button) */
    extraActions?: React.ReactNode;
    /** Optional: Save button text (default: "Kaydet") */
    saveButtonText?: string;
    /** Optional: Whether form has unsaved changes */
    isDirty?: boolean;
}

/**
 * Reusable Sales Form Page Layout
 *
 * Features:
 * - Glass effect sticky header with blur
 * - Centered content with max-w-4xl
 * - Back button, title, subtitle
 * - Cancel and Save buttons
 * - Premium slate theme styling
 * - Loading and error states for edit pages
 * - Unsaved changes warning
 */
export function SalesFormPageLayout({
    title,
    subtitle,
    cancelPath,
    loading = false,
    onSave,
    children,
    titleExtra,
    isDataLoading = false,
    dataError = false,
    errorMessage = 'Kayıt Bulunamadı',
    errorDescription = 'İstenen kayıt bulunamadı veya bir hata oluştu.',
    extraActions,
    saveButtonText = 'Kaydet',
    isDirty = false,
}: SalesFormPageLayoutProps) {
    const router = useRouter();
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

    // Warn user about unsaved changes when leaving the page
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = 'Kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılmak istediğinize emin misiniz?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Handle navigation with unsaved changes check
    const handleNavigation = useCallback((path: string | 'back') => {
        if (isDirty) {
            setPendingNavigation(path);
            setShowUnsavedModal(true);
        } else {
            if (path === 'back') {
                router.back();
            } else {
                router.push(path);
            }
        }
    }, [isDirty, router]);

    const confirmNavigation = useCallback(() => {
        setShowUnsavedModal(false);
        if (pendingNavigation === 'back') {
            router.back();
        } else if (pendingNavigation) {
            router.push(pendingNavigation);
        }
        setPendingNavigation(null);
    }, [pendingNavigation, router]);

    const cancelNavigation = useCallback(() => {
        setShowUnsavedModal(false);
        setPendingNavigation(null);
    }, []);

    // Loading state
    if (isDataLoading) {
        return (
            <div className="min-h-screen bg-white flex justify-center items-center">
                <Spinner size="lg" />
            </div>
        );
    }

    // Error state
    if (dataError) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">{errorMessage}</h3>
                    <p className="text-red-600 mb-4">{errorDescription}</p>
                    <Button variant="secondary" onClick={() => router.push(cancelPath)}>
                        Geri Dön
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Unsaved Changes Modal */}
            {showUnsavedModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={cancelNavigation}
                    />
                    {/* Modal */}
                    <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                    Kaydedilmemiş Değişiklikler
                                </h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    Kaydetmediğiniz değişiklikler var. Sayfadan ayrılırsanız bu değişiklikler kaybolacaktır.
                                </p>
                                <div className="flex items-center gap-3 justify-end">
                                    <Button
                                        variant="secondary"
                                        onClick={cancelNavigation}
                                    >
                                        Düzenlemeye Dön
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={confirmNavigation}
                                        className="!bg-amber-600 hover:!bg-amber-700"
                                    >
                                        Değişiklikleri Kaydetmeden Çık
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Glass Effect Sticky Header */}
            <div
                className="sticky top-0 z-50 px-8 py-4"
                style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                }}
            >
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleNavigation('back')}
                            className="p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-semibold text-slate-900">
                                    {title}
                                </h1>
                                {titleExtra}
                                {isDirty && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                                        Kaydedilmedi
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-400">{subtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {extraActions}
                        <Button variant="secondary" onClick={() => handleNavigation(cancelPath)}>
                            Vazgeç
                        </Button>
                        <Button
                            variant="primary"
                            loading={loading}
                            onClick={onSave}
                        >
                            {saveButtonText}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Page Content */}
            <div className="px-8 py-8 max-w-4xl mx-auto">
                {children}
            </div>
        </div>
    );
}
