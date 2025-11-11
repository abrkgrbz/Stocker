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
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
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
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
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
