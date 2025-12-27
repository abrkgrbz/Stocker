'use client';

import { toast as sonnerToast } from 'sonner';
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, {
      description: options?.description,
      duration: options?.duration || Infinity,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
      description?: string;
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      description: options.description,
    });
  },

  custom: (jsx: React.ReactNode, options?: { duration?: number }) => {
    return sonnerToast.custom(jsx as any, {
      duration: options?.duration,
    });
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  // Helper for API operations
  apiOperation: async <T,>(
    operation: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error?: string;
    }
  ): Promise<T> => {
    const toastId = toast.loading(messages.loading);

    try {
      const result = await operation;
      toast.dismiss(toastId);
      toast.success(messages.success);
      return result;
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(
        messages.error || 'Bir hata oluştu',
        {
          description: error instanceof Error ? error.message : undefined,
        }
      );
      throw error;
    }
  },
};

export function useToast() {
  return toast;
}
