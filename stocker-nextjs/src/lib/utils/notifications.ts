import Swal from 'sweetalert2';

/**
 * SweetAlert2 based notification utilities for consistent UX across the app
 */

export const showSuccess = (message: string, title: string = 'Başarılı!') => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonText: 'Tamam',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
};

export const showError = (message: string, title: string = 'Hata!') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'Tamam',
  });
};

export const showWarning = (message: string, title: string = 'Uyarı!') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonText: 'Tamam',
  });
};

export const showInfo = (message: string, title: string = 'Bilgi') => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonText: 'Tamam',
  });
};

export const showConfirm = (
  message: string,
  title: string = 'Emin misiniz?',
  confirmText: string = 'Evet',
  cancelText: string = 'Hayır'
) => {
  return Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#0f172a',
    cancelButtonColor: '#e2e8f0',
  });
};

export const showDeleteConfirm = (itemName: string = 'bu öğeyi') => {
  return Swal.fire({
    icon: 'warning',
    title: 'Silmek istediğinize emin misiniz?',
    text: `${itemName} kalıcı olarak silinecektir!`,
    showCancelButton: true,
    confirmButtonText: 'Evet, Sil',
    cancelButtonText: 'İptal',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#e2e8f0',
  });
};

export const showLoading = (message: string = 'İşlem yapılıyor...') => {
  return Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeLoading = () => {
  Swal.close();
};

/**
 * Show API error with detailed information
 * Parses error response and displays in user-friendly format
 */
export const showApiError = (error: any, defaultMessage: string = 'İşlem başarısız') => {
  const apiError = error?.response?.data;
  let errorMessage = defaultMessage;
  let errorDetails: string[] = [];

  if (apiError) {
    // Try to extract main error message
    errorMessage = apiError.description || apiError.detail || apiError.title || apiError.message || defaultMessage;

    // Collect all error details
    if (apiError.errors) {
      if (Array.isArray(apiError.errors)) {
        // Array format: [{ field, message }]
        errorDetails = apiError.errors.map((e: any) =>
          e.field ? `<strong>${e.field}:</strong> ${e.message}` : e.message
        );
      } else {
        // Object format: { field1: ["error1", "error2"], field2: ["error3"] }
        Object.keys(apiError.errors).forEach(field => {
          const fieldErrors = apiError.errors[field];
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach(msg => {
              errorDetails.push(`<strong>${field}:</strong> ${msg}`);
            });
          }
        });
      }
    }
  } else if (error?.message) {
    errorMessage = error.message;
  }

  return Swal.fire({
    icon: 'error',
    title: 'Hata!',
    html: errorDetails.length > 0
      ? `<p>${errorMessage}</p><hr/><div style="text-align: left; margin-top: 10px;">${errorDetails.join('<br/>')}</div>`
      : errorMessage,
    confirmButtonText: 'Tamam',
    customClass: {
      htmlContainer: 'swal-html-container'
    }
  });
};
