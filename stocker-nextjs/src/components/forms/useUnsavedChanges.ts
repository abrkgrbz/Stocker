'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FormInstance } from 'antd';
import { Modal } from 'antd';

interface UseUnsavedChangesOptions {
  /** The Ant Design form instance */
  form: FormInstance;
  /** Whether the feature is enabled */
  enabled?: boolean;
  /** Initial values to compare against */
  initialValues?: Record<string, any>;
  /** Custom message for the confirmation dialog */
  message?: string;
  /** Custom title for the confirmation dialog */
  title?: string;
  /** Callback when user confirms leaving */
  onConfirmLeave?: () => void;
}

interface UseUnsavedChangesReturn {
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Reset the dirty state */
  resetChanges: () => void;
  /** Mark as saved (reset dirty state) */
  markAsSaved: () => void;
  /** Manually check if form is dirty */
  checkForChanges: () => boolean;
  /** Show confirmation dialog before action */
  confirmIfDirty: (onConfirm: () => void) => void;
}

/**
 * Hook to track unsaved changes in a form and warn users before leaving
 */
export function useUnsavedChanges({
  form,
  enabled = true,
  initialValues = {},
  message = 'Kaydedilmemiş değişiklikler var. Sayfadan ayrılmak istediğinize emin misiniz?',
  title = 'Kaydedilmemiş Değişiklikler',
  onConfirmLeave,
}: UseUnsavedChangesOptions): UseUnsavedChangesReturn {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [savedValues, setSavedValues] = useState<Record<string, any>>(initialValues);

  // Check if form values have changed from saved values
  const checkForChanges = useCallback((): boolean => {
    if (!enabled) return false;

    try {
      const currentValues = form.getFieldsValue(true);
      const hasChanges = JSON.stringify(currentValues) !== JSON.stringify(savedValues);
      return hasChanges;
    } catch {
      return false;
    }
  }, [form, savedValues, enabled]);

  // Update dirty state when form values change
  useEffect(() => {
    if (!enabled) return;

    const handleValuesChange = () => {
      const hasChanges = checkForChanges();
      setIsDirty(hasChanges);
    };

    // Check periodically (form doesn't have a reliable onChange for all cases)
    const interval = setInterval(handleValuesChange, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [checkForChanges, enabled]);

  // Handle browser back/forward/close
  useEffect(() => {
    if (!enabled || !isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, message, enabled]);

  // Reset dirty state
  const resetChanges = useCallback(() => {
    setIsDirty(false);
    setSavedValues(form.getFieldsValue(true));
  }, [form]);

  // Mark form as saved
  const markAsSaved = useCallback(() => {
    const currentValues = form.getFieldsValue(true);
    setSavedValues(currentValues);
    setIsDirty(false);
  }, [form]);

  // Show confirmation dialog before performing an action
  const confirmIfDirty = useCallback((onConfirm: () => void) => {
    if (!isDirty) {
      onConfirm();
      return;
    }

    Modal.confirm({
      title,
      content: message,
      okText: 'Evet, Ayrıl',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: () => {
        onConfirmLeave?.();
        onConfirm();
      },
    });
  }, [isDirty, title, message, onConfirmLeave]);

  return {
    hasUnsavedChanges: isDirty,
    resetChanges,
    markAsSaved,
    checkForChanges,
    confirmIfDirty,
  };
}

export default useUnsavedChanges;
