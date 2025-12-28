/**
 * Alerts Utility - Wrapper around SweetAlert2
 * Provides a unified showAlert object for consistent usage
 */

import Swal from 'sweetalert2';

// Re-export everything from sweetalert.ts for backward compatibility
export * from './sweetalert';

// Brand color for consistent styling
const BRAND_COLOR = '#667eea';

/**
 * Unified showAlert object for consistent alert API
 */
export const showAlert = {
  /**
   * Show success alert
   */
  success: async (title: string, message?: string) => {
    await Swal.fire({
      icon: 'success',
      title,
      text: message,
      confirmButtonColor: BRAND_COLOR,
      timer: 3000,
      timerProgressBar: true,
    });
  },

  /**
   * Show error alert
   */
  error: async (title: string, message?: string) => {
    await Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonColor: BRAND_COLOR,
    });
  },

  /**
   * Show warning alert
   */
  warning: async (title: string, message?: string) => {
    await Swal.fire({
      icon: 'warning',
      title,
      text: message,
      confirmButtonColor: BRAND_COLOR,
    });
  },

  /**
   * Show info alert
   */
  info: async (title: string, message?: string) => {
    await Swal.fire({
      icon: 'info',
      title,
      text: message,
      confirmButtonColor: BRAND_COLOR,
    });
  },

  /**
   * Show confirmation dialog
   * @returns true if user confirmed, false otherwise
   */
  confirm: async (title: string, message?: string, confirmText: string = 'Evet', cancelText: string = 'İptal'): Promise<boolean> => {
    const result = await Swal.fire({
      title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: BRAND_COLOR,
      cancelButtonColor: '#d9d9d9',
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
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d9d9d9',
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
