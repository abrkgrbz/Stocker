/**
 * Standardized SweetAlert2 Utilities
 * Consistent alerts across all CRUD operations
 * Themed to match Stocker Design System
 */

import Swal from 'sweetalert2';

// =====================================
// STOCKER DESIGN SYSTEM COLORS
// =====================================
// Synced with src/theme/colors.ts

const COLORS = {
  // Brand Primary (Slate/Dark)
  primary: {
    main: '#0f172a',
    hover: '#1e293b',
    active: '#334155',
    light: '#f1f5f9',
  },
  // Semantic Colors
  success: {
    main: '#10b981',
    dark: '#047857',
    light: '#ecfdf5',
    text: '#065f46',
  },
  warning: {
    main: '#f59e0b',
    dark: '#d97706',
    light: '#fffbeb',
    text: '#92400e',
  },
  error: {
    main: '#ef4444',
    dark: '#dc2626',
    light: '#fef2f2',
    text: '#991b1b',
  },
  info: {
    main: '#3b82f6',
    dark: '#2563eb',
    light: '#eff6ff',
    text: '#1e40af',
  },
  // Neutral (Slate)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    600: '#475569',
    700: '#334155',
    900: '#0f172a',
  },
} as const;

// =====================================
// BASE SWAL CONFIGURATION
// =====================================

const baseSwalConfig = {
  customClass: {
    popup: 'stocker-swal-popup',
    title: 'stocker-swal-title',
    htmlContainer: 'stocker-swal-text',
    confirmButton: 'stocker-swal-confirm',
    cancelButton: 'stocker-swal-cancel',
    timerProgressBar: 'stocker-swal-timer',
  },
  buttonsStyling: true,
  showClass: {
    popup: 'animate__animated animate__fadeIn animate__faster',
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOut animate__faster',
  },
};

/**
 * Success alert for create operations
 */
export const showCreateSuccess = (entityName: string, itemName?: string) => {
  return Swal.fire({
    ...baseSwalConfig,
    icon: 'success',
    title: 'Başarılı!',
    text: itemName
      ? `${itemName} ${entityName} başarıyla oluşturuldu`
      : `${entityName} başarıyla oluşturuldu`,
    confirmButtonText: 'Tamam',
    confirmButtonColor: COLORS.success.main,
    iconColor: COLORS.success.main,
    timer: 2500,
    timerProgressBar: true,
    background: '#ffffff',
    color: COLORS.slate[900],
  });
};

/**
 * Success alert for update operations
 */
export const showUpdateSuccess = (entityName: string, itemName?: string) => {
  return Swal.fire({
    ...baseSwalConfig,
    icon: 'success',
    title: 'Güncellendi!',
    text: itemName
      ? `${itemName} ${entityName} başarıyla güncellendi`
      : `${entityName} başarıyla güncellendi`,
    confirmButtonText: 'Tamam',
    confirmButtonColor: COLORS.success.main,
    iconColor: COLORS.success.main,
    timer: 2500,
    timerProgressBar: true,
    background: '#ffffff',
    color: COLORS.slate[900],
  });
};

/**
 * Success alert for delete operations
 */
export const showDeleteSuccess = (entityName: string, itemName?: string) => {
  return Swal.fire({
    ...baseSwalConfig,
    icon: 'success',
    title: 'Silindi!',
    text: itemName
      ? `${itemName} ${entityName} başarıyla silindi`
      : `${entityName} başarıyla silindi`,
    confirmButtonText: 'Tamam',
    confirmButtonColor: COLORS.success.main,
    iconColor: COLORS.success.main,
    timer: 2500,
    timerProgressBar: true,
    background: '#ffffff',
    color: COLORS.slate[900],
  });
};

/**
 * Generic success alert for any operation
 */
export const showSuccess = (title: string, message?: string) => {
  return Swal.fire({
    ...baseSwalConfig,
    icon: 'success',
    title,
    text: message,
    confirmButtonText: 'Tamam',
    confirmButtonColor: COLORS.success.main,
    iconColor: COLORS.success.main,
    timer: 2500,
    timerProgressBar: true,
    background: '#ffffff',
    color: COLORS.slate[900],
  });
};

/**
 * Error alert for any operation
 */
export const showError = (message: string, title: string = 'Hata!') => {
  return Swal.fire({
    ...baseSwalConfig,
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'Tamam',
    confirmButtonColor: COLORS.slate[900],
    iconColor: COLORS.error.main,
    background: '#ffffff',
    color: COLORS.slate[900],
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
    ...baseSwalConfig,
    title: `${entityName} Sil`,
    html: `
      <p style="color: ${COLORS.slate[700]}; margin: 0;">
        <strong>${itemName}</strong> adlı ${entityName.toLowerCase()}yı silmek istediğinizden emin misiniz?
      </p>
      ${additionalWarning ? `<p style="color: ${COLORS.error.main}; margin-top: 12px; font-size: 14px;">⚠️ ${additionalWarning}</p>` : ''}
    `,
    icon: 'warning',
    iconColor: COLORS.error.main,
    showCancelButton: true,
    confirmButtonColor: COLORS.error.main,
    cancelButtonColor: COLORS.slate[200],
    confirmButtonText: 'Evet, Sil',
    cancelButtonText: 'İptal',
    reverseButtons: true,
    background: '#ffffff',
    color: COLORS.slate[900],
  });

  return result.isConfirmed;
};

/**
 * Confirmation dialog for any operation
 * @param variant - 'success' | 'warning' | 'danger' | 'info' - determines icon color
 */
export const confirmAction = async (
  title: string,
  message: string,
  confirmText: string = 'Evet',
  variant: 'success' | 'warning' | 'danger' | 'info' = 'info',
  cancelText: string = 'İptal'
): Promise<boolean> => {
  const variantIconColors = {
    success: COLORS.success.main,
    warning: COLORS.warning.main,
    danger: COLORS.error.main,
    info: COLORS.slate[900],
  };

  const variantButtonColors = {
    success: COLORS.success.main,
    warning: COLORS.slate[900],
    danger: COLORS.error.main,
    info: COLORS.slate[900],
  };

  const variantIcons = {
    success: 'question' as const,
    warning: 'warning' as const,
    danger: 'warning' as const,
    info: 'question' as const,
  };

  const result = await Swal.fire({
    ...baseSwalConfig,
    title,
    text: message,
    icon: variantIcons[variant],
    iconColor: variantIconColors[variant],
    showCancelButton: true,
    confirmButtonColor: variantButtonColors[variant],
    cancelButtonColor: COLORS.slate[200],
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    background: '#ffffff',
    color: COLORS.slate[900],
  });

  return result.isConfirmed;
};

/**
 * Info alert for general information
 */
export const showInfo = (title: string, message: string) => {
  return Swal.fire({
    ...baseSwalConfig,
    icon: 'info',
    title,
    text: message,
    confirmButtonText: 'Tamam',
    confirmButtonColor: COLORS.slate[900],
    iconColor: COLORS.info.main,
    background: '#ffffff',
    color: COLORS.slate[900],
  });
};

/**
 * Warning alert
 */
export const showWarning = (title: string, message: string) => {
  return Swal.fire({
    ...baseSwalConfig,
    icon: 'warning',
    title,
    text: message,
    confirmButtonText: 'Tamam',
    confirmButtonColor: COLORS.slate[900],
    iconColor: COLORS.warning.main,
    background: '#ffffff',
    color: COLORS.slate[900],
  });
};

/**
 * Loading alert (useful for async operations)
 */
export const showLoading = (message: string = 'İşlem yapılıyor...') => {
  return Swal.fire({
    ...baseSwalConfig,
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    background: '#ffffff',
    color: COLORS.slate[900],
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
