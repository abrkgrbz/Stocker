/**
 * Alerts Utility - Wrapper around SweetAlert2
 * Provides a unified showAlert object for consistent usage
 */

import Swal from 'sweetalert2';

// Re-export everything from sweetalert.ts for backward compatibility
export * from './sweetalert';

// Stocker Design System Colors
const COLORS = {
  primary: '#0f172a',      // slate-900 (default button)
  success: '#10b981',      // emerald-500 (success button)
  danger: '#ef4444',       // red-500 (danger button)
  cancel: '#e2e8f0',       // slate-200 (cancel button)
};

/**
 * Unified showAlert object for consistent alert API
 */
export const showAlert = {
  /**
   * Show success alert (green button)
   */
  success: async (title: string, message?: string) => {
    await Swal.fire({
      icon: 'success',
      title,
      text: message,
      confirmButtonText: 'Tamam',
      confirmButtonColor: COLORS.success,
      timer: 3000,
      timerProgressBar: true,
    });
  },

  /**
   * Show error alert (slate button)
   */
  error: async (title: string, message?: string) => {
    await Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Tamam',
      confirmButtonColor: COLORS.primary,
    });
  },

  /**
   * Show warning alert (slate button)
   */
  warning: async (title: string, message?: string) => {
    await Swal.fire({
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'Tamam',
      confirmButtonColor: COLORS.primary,
    });
  },

  /**
   * Show info alert (slate button)
   */
  info: async (title: string, message?: string) => {
    await Swal.fire({
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'Tamam',
      confirmButtonColor: COLORS.primary,
    });
  },

  /**
   * Show confirmation dialog (slate button)
   * @returns true if user confirmed, false otherwise
   */
  confirm: async (title: string, message?: string, confirmText: string = 'Evet', cancelText: string = 'İptal'): Promise<boolean> => {
    const result = await Swal.fire({
      title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: COLORS.primary,
      cancelButtonColor: COLORS.cancel,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
    });

    return result.isConfirmed;
  },

  /**
   * Show confirmation dialog for dangerous actions (red button)
   * @returns true if user confirmed, false otherwise
   */
  confirmDanger: async (title: string, message?: string, confirmText: string = 'Evet, Sil', cancelText: string = 'İptal'): Promise<boolean> => {
    const result = await Swal.fire({
      title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: COLORS.danger,
      cancelButtonColor: COLORS.cancel,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
    });

    return result.isConfirmed;
  },

  /**
   * Show loading alert
   */
  loading: (message: string = 'İşlem yapılıyor...') => {
    return Swal.fire({
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },

  /**
   * Close any open alert
   */
  close: () => {
    Swal.close();
  },
};
