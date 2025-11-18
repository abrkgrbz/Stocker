import Swal from 'sweetalert2';

// Stocker brand colors - matching register page violet/purple theme
const brandColors = {
  primary: '#7c3aed',      // violet-600
  primaryHover: '#8b5cf6', // violet-500
  success: '#16a34a',      // green-600
  error: '#dc2626',        // red-600
  warning: '#ea580c',      // orange-600
  info: '#7c3aed',         // violet-600
  neutral: '#9ca3af',      // gray-400
};

/**
 * Custom SweetAlert2 configuration matching Stocker brand theme
 * Violet/Purple gradient design matching register page
 */
export const showAlert = {
  /**
   * Success alert
   */
  success: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'Tamam',
      confirmButtonColor: brandColors.success,
      customClass: {
        popup: 'rounded-xl',
        title: 'text-xl font-bold text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'rounded-lg px-6 py-3 font-semibold shadow-md hover:shadow-lg transition-all',
      },
      buttonsStyling: false,
    });
  },

  /**
   * Error alert with optional error list
   */
  error: (title: string, message: string | string[], options?: { width?: string }) => {
    let html = '';

    if (Array.isArray(message)) {
      // Multiple errors as bullet list
      html = `
        <div class="text-left">
          <ul class="list-disc list-inside space-y-2 text-sm text-gray-700">
            ${message.map(msg => `<li class="leading-relaxed">${msg}</li>`).join('')}
          </ul>
        </div>
      `;
    } else {
      html = `<p class="text-sm text-gray-700 leading-relaxed">${message}</p>`;
    }

    return Swal.fire({
      icon: 'error',
      title,
      html,
      confirmButtonText: 'Tamam',
      confirmButtonColor: brandColors.error,
      width: options?.width || '450px',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-xl font-bold text-gray-900',
        htmlContainer: 'text-sm',
        confirmButton: 'rounded-lg px-6 py-3 font-semibold shadow-md hover:shadow-lg transition-all',
      },
      buttonsStyling: false,
    });
  },

  /**
   * Warning alert
   */
  warning: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'Tamam',
      confirmButtonColor: brandColors.warning,
      customClass: {
        popup: 'rounded-xl',
        title: 'text-xl font-bold text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'rounded-lg px-6 py-3 font-semibold shadow-md hover:shadow-lg transition-all',
      },
      buttonsStyling: false,
    });
  },

  /**
   * Info alert with violet brand color and gradient
   */
  info: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonText: 'Tamam',
      confirmButtonColor: brandColors.primary,
      customClass: {
        popup: 'rounded-xl',
        title: 'text-xl font-bold text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'rounded-lg px-6 py-3 font-semibold shadow-md hover:shadow-lg transition-all',
      },
      buttonsStyling: false,
    });
  },

  /**
   * Confirmation dialog with violet primary button
   */
  confirm: (title: string, text: string, confirmText = 'Evet', cancelText = 'Hayır') => {
    return Swal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: brandColors.primary,
      cancelButtonColor: brandColors.neutral,
      reverseButtons: true,
      customClass: {
        popup: 'rounded-xl',
        title: 'text-xl font-bold text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'rounded-lg px-6 py-3 font-semibold shadow-md hover:shadow-lg transition-all',
        cancelButton: 'rounded-lg px-6 py-3 font-medium shadow-sm hover:shadow-md transition-all text-gray-700 bg-white border-2 border-gray-300',
      },
      buttonsStyling: false,
    });
  },

  /**
   * Validation errors (for forms)
   */
  validationError: (errors: Record<string, string[]> | string) => {
    let errorList: string[] = [];

    if (typeof errors === 'string') {
      errorList = [errors];
    } else if (typeof errors === 'object') {
      errorList = Object.values(errors).flat();
    }

    return showAlert.error('Doğrulama Hataları', errorList, { width: '550px' });
  },
};

/**
 * Loading/Progress alerts with violet spinner
 */
export const showLoading = {
  start: (title = 'Lütfen bekleyin...', text?: string) => {
    Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'rounded-xl',
        title: 'text-xl font-bold text-gray-900',
      },
    });
  },

  stop: () => {
    Swal.close();
  },

  update: (title: string, text?: string) => {
    Swal.update({
      title,
      text,
    });
  },
};

export default showAlert;
