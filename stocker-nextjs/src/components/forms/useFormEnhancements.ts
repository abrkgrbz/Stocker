'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import type { FormInstance } from 'antd';
import { message } from 'antd';

interface UseFormEnhancementsOptions {
  /** The Ant Design form instance */
  form: FormInstance;
  /** Whether auto-save is enabled */
  autoSaveEnabled?: boolean;
  /** Auto-save interval in milliseconds (default: 30000 = 30 seconds) */
  autoSaveInterval?: number;
  /** Storage key for drafts (required for auto-save) */
  storageKey?: string;
  /** Whether keyboard shortcuts are enabled */
  keyboardShortcutsEnabled?: boolean;
  /** Callback when Ctrl+S is pressed */
  onSave?: () => void;
  /** Callback when draft is loaded */
  onDraftLoaded?: (draft: Record<string, any>) => void;
}

interface UseFormEnhancementsReturn {
  /** Whether there's a saved draft */
  hasDraft: boolean;
  /** Load saved draft into form */
  loadDraft: () => void;
  /** Clear saved draft */
  clearDraft: () => void;
  /** Save current form as draft */
  saveDraft: () => void;
  /** Last auto-save timestamp */
  lastAutoSave: Date | null;
}

/**
 * Hook for form enhancements: auto-save draft, keyboard shortcuts
 */
export function useFormEnhancements({
  form,
  autoSaveEnabled = false,
  autoSaveInterval = 30000,
  storageKey,
  keyboardShortcutsEnabled = true,
  onSave,
  onDraftLoaded,
}: UseFormEnhancementsOptions): UseFormEnhancementsReturn {
  const [hasDraft, setHasDraft] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Storage key for drafts
  const draftKey = storageKey ? `form_draft_${storageKey}` : null;

  // Check if draft exists on mount
  useEffect(() => {
    if (!draftKey) return;

    try {
      const draft = localStorage.getItem(draftKey);
      setHasDraft(!!draft);
    } catch {
      // localStorage might not be available
    }
  }, [draftKey]);

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    if (!draftKey) return;

    try {
      const values = form.getFieldsValue(true);
      const draftData = {
        values,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      setHasDraft(true);
      setLastAutoSave(new Date());
    } catch {
      console.warn('Could not save draft to localStorage');
    }
  }, [form, draftKey]);

  // Load draft from localStorage
  const loadDraft = useCallback(() => {
    if (!draftKey) return;

    try {
      const draftStr = localStorage.getItem(draftKey);
      if (draftStr) {
        const draftData = JSON.parse(draftStr);
        form.setFieldsValue(draftData.values);
        onDraftLoaded?.(draftData.values);
        message.success('Taslak yüklendi');
      }
    } catch {
      message.error('Taslak yüklenemedi');
    }
  }, [form, draftKey, onDraftLoaded]);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    if (!draftKey) return;

    try {
      localStorage.removeItem(draftKey);
      setHasDraft(false);
    } catch {
      // Ignore errors
    }
  }, [draftKey]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !draftKey) return;

    autoSaveTimerRef.current = setInterval(() => {
      saveDraft();
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveEnabled, autoSaveInterval, saveDraft, draftKey]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!keyboardShortcutsEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) {
          onSave();
        } else {
          // Trigger form submit
          form.submit();
        }
      }

      // Ctrl+Shift+S to save as draft
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        saveDraft();
        message.info('Taslak kaydedildi');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [keyboardShortcutsEnabled, onSave, form, saveDraft]);

  return {
    hasDraft,
    loadDraft,
    clearDraft,
    saveDraft,
    lastAutoSave,
  };
}

export default useFormEnhancements;
