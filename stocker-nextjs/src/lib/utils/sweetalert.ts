/**
 * Standardized SweetAlert2 Utilities
 * Consistent alerts across all CRUD operations
 */

import Swal from 'sweetalert2';

// Brand color for consistent styling
const BRAND_COLOR = '#667eea';

/**
 * Success alert for create operations
 */
export const showCreateSuccess = (entityName: string, itemName?: string) => {
  return Swal.fire({
    icon: 'success',
    title: 'Başarılı!',
    text: itemName
      ? `${itemName} ${entityName} başarıyla oluşturuldu`
      : `${entityName} başarıyla oluşturuldu`,
    confirmButtonColor: BRAND_COLOR,
    timer: 2000,
    timerProgressBar: true,
  });
};

/**
 * Success alert for update operations
 */
export const showUpdateSuccess = (entityName: string, itemName?: string) => {
  return Swal.fire({
    icon: 'success',
    title: 'Başarılı!',
    text: itemName
      ? `${itemName} ${entityName} başarıyla güncellendi`
      : `${entityName} başarıyla güncellendi`,
    confirmButtonColor: BRAND_COLOR,
    timer: 2000,
    timerProgressBar: true,
  });
};

/**
 * Success alert for delete operations
 */
export const showDeleteSuccess = (entityName: string, itemName?: string) => {
  return Swal.fire({
    icon: 'success',
    title: 'Başarılı!',
    text: itemName
      ? `${itemName} ${entityName} başarıyla silindi`
      : `${entityName} başarıyla silindi`,
    confirmButtonColor: BRAND_COLOR,
    timer: 2000,
    timerProgressBar: true,
  });
};

/**
 * Error alert for any operation
 */
export const showError = (message: string, title: string = 'Hata!') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: BRAND_COLOR,
  });
};

/**
 * Confirmation dialog for delete operations
 */
export const confirmDelete = async (
  entityName: string,
  itemName: string,
  additionalWarning?: string
): Promise<boolean> => {
  const result = await Swal.fire({
    title: `${entityName} Sil`,
    html: `
      <p><strong>${itemName}</strong> ${entityName.toLowerCase()}ünü silmek istediğinizden emin misiniz?</p>
      ${additionalWarning ? `<p style="color: #ff4d4f; margin-top: 12px;">⚠️ ${additionalWarning}</p>` : ''}
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff4d4f',
    cancelButtonColor: '#d9d9d9',
    confirmButtonText: 'Evet, Sil',
    cancelButtonText: 'İptal',
    reverseButtons: true,
  });

  return result.isConfirmed;
};

/**
 * Confirmation dialog for any operation
 */
export const confirmAction = async (
  title: string,
  message: string,
  confirmText: string = 'Evet',
  cancelText: string = 'İptal'
): Promise<boolean> => {
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
};

/**
 * Info alert for general information
 */
export const showInfo = (title: string, message: string) => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonColor: BRAND_COLOR,
  });
};

/**
 * Warning alert
 */
export const showWarning = (title: string, message: string) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonColor: BRAND_COLOR,
  });
};

/**
 * Loading alert (useful for async operations)
 */
export const showLoading = (message: string = 'İşlem yapılıyor...') => {
  return Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

/**
 * Close any open alert
 */
export const closeAlert = () => {
  Swal.close();
};
