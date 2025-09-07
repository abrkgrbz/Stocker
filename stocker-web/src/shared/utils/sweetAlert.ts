import Swal from 'sweetalert2';

// Custom SweetAlert2 configuration with Turkish translations and modern design
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

// API Response Handler
export const showApiResponse = {
  // Success response handler
  success: (message: string, title?: string) => {
    return Swal.fire({
      icon: 'success',
      title: title || 'Başarılı!',
      text: message,
      confirmButtonText: 'Tamam',
      confirmButtonColor: '#667eea',
      showCloseButton: true,
      timer: 5000,
      timerProgressBar: true
    });
  },

  // Error response handler with details
  error: (error: any, defaultMessage: string = 'Bir hata oluştu') => {
    let errorMessage = defaultMessage;
    let errorDetails = '';

    // Parse error from API response
    if (error?.response?.data) {
      const data = error.response.data;
      
      // Handle different error response formats
      if (data.message) {
        errorMessage = data.message;
      } else if (data.errors) {
        // Handle validation errors
        if (Array.isArray(data.errors)) {
          errorDetails = data.errors.join('\n');
        } else if (typeof data.errors === 'object') {
          errorDetails = Object.entries(data.errors)
            .map(([field, errors]: [string, any]) => {
              if (Array.isArray(errors)) {
                return `${field}: ${errors.join(', ')}`;
              }
              return `${field}: ${errors}`;
            })
            .join('\n');
        }
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
      
      // Add status code if available
      if (error.response.status) {
        errorDetails = errorDetails 
          ? `Hata Kodu: ${error.response.status}\n${errorDetails}`
          : `Hata Kodu: ${error.response.status}`;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return Swal.fire({
      icon: 'error',
      title: 'Hata!',
      text: errorMessage,
      footer: errorDetails ? `<pre style="text-align: left; font-size: 12px;">${errorDetails}</pre>` : undefined,
      confirmButtonText: 'Tamam',
      confirmButtonColor: '#667eea',
      showCloseButton: true,
      width: errorDetails ? '600px' : '400px'
    });
  },

  // Warning response handler
  warning: (message: string, title?: string) => {
    return Swal.fire({
      icon: 'warning',
      title: title || 'Uyarı!',
      text: message,
      confirmButtonText: 'Anladım',
      confirmButtonColor: '#667eea',
      showCloseButton: true
    });
  },

  // Info response handler
  info: (message: string, title?: string) => {
    return Swal.fire({
      icon: 'info',
      title: title || 'Bilgi',
      text: message,
      confirmButtonText: 'Tamam',
      confirmButtonColor: '#667eea',
      showCloseButton: true
    });
  },

  // Loading indicator
  loading: (message: string = 'İşleminiz gerçekleştiriliyor...') => {
    return Swal.fire({
      title: message,
      html: `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div class="swal2-loading" style="display: block;"></div>
          <p style="margin-top: 1rem;">Lütfen bekleyin...</p>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },

  // Toast notifications
  toast: {
    success: (message: string) => {
      return Toast.fire({
        icon: 'success',
        title: message
      });
    },
    error: (message: string) => {
      return Toast.fire({
        icon: 'error',
        title: message
      });
    },
    warning: (message: string) => {
      return Toast.fire({
        icon: 'warning',
        title: message
      });
    },
    info: (message: string) => {
      return Toast.fire({
        icon: 'info',
        title: message
      });
    }
  },

  // Confirmation dialog
  confirm: async (
    message: string, 
    title: string = 'Emin misiniz?',
    confirmText: string = 'Evet',
    cancelText: string = 'Hayır'
  ) => {
    const result = await Swal.fire({
      title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true
    });
    
    return result.isConfirmed;
  },

  // Input dialog
  prompt: async (
    title: string,
    inputLabel: string,
    inputPlaceholder?: string,
    inputValue?: string
  ) => {
    const result = await Swal.fire({
      title,
      input: 'text',
      inputLabel,
      inputValue: inputValue || '',
      inputPlaceholder: inputPlaceholder || '',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tamam',
      cancelButtonText: 'İptal',
      inputValidator: (value) => {
        if (!value) {
          return 'Bu alan zorunludur!';
        }
        return null;
      }
    });

    return result.value;
  }
};

// Helper function to parse and display API validation errors
export const showValidationErrors = (errors: any) => {
  let errorHtml = '<div style="text-align: left;">';
  
  if (Array.isArray(errors)) {
    errorHtml += '<ul>';
    errors.forEach(error => {
      errorHtml += `<li>${error}</li>`;
    });
    errorHtml += '</ul>';
  } else if (typeof errors === 'object') {
    errorHtml += '<ul>';
    Object.entries(errors).forEach(([field, fieldErrors]: [string, any]) => {
      if (Array.isArray(fieldErrors)) {
        fieldErrors.forEach(error => {
          errorHtml += `<li><strong>${field}:</strong> ${error}</li>`;
        });
      } else {
        errorHtml += `<li><strong>${field}:</strong> ${fieldErrors}</li>`;
      }
    });
    errorHtml += '</ul>';
  }
  
  errorHtml += '</div>';

  Swal.fire({
    icon: 'error',
    title: 'Doğrulama Hataları',
    html: errorHtml,
    confirmButtonText: 'Tamam',
    confirmButtonColor: '#667eea',
    width: '600px'
  });
};

// Helper function for registration success with email verification info
export const showRegistrationSuccess = async (email: string) => {
  return Swal.fire({
    icon: 'success',
    title: 'Kayıt Başarılı!',
    html: `
      <div style="text-align: center;">
        <p><strong>${email}</strong> adresine doğrulama e-postası gönderildi.</p>
        <p style="margin-top: 1rem; color: #666;">
          E-postanızı kontrol ederek hesabınızı aktif hale getirebilirsiniz.
        </p>
        <div style="margin-top: 1.5rem; padding: 1rem; background: #f0f9ff; border-radius: 8px;">
          <p style="margin: 0; color: #0369a1; font-size: 14px;">
            <strong>Not:</strong> E-posta gelmezse spam klasörünü kontrol edin.
          </p>
        </div>
      </div>
    `,
    confirmButtonText: 'Anladım',
    confirmButtonColor: '#667eea',
    showCloseButton: true,
    timer: 10000,
    timerProgressBar: true
  });
};

// Helper function for login success with modern centered alert
export const showLoginSuccess = (userName: string) => {
  return Swal.fire({
    icon: 'success',
    title: `Hoş geldiniz ${userName}!`,
    text: 'Başarıyla giriş yaptınız.',
    confirmButtonText: 'Devam Et',
    confirmButtonColor: '#667eea',
    showConfirmButton: true,
    timer: 5000,
    timerProgressBar: true,
    position: 'center',
    backdrop: true,
    customClass: {
      popup: 'modern-alert-popup',
      title: 'modern-alert-title',
      htmlContainer: 'modern-alert-text',
      confirmButton: 'modern-alert-button',
      timerProgressBar: 'modern-alert-progress'
    },
    showClass: {
      popup: 'animate__animated animate__fadeInDown animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp animate__faster'
    }
  });
};

// Alternative: Beautiful welcome alert with animation
export const showWelcomeAlert = (userName: string, role?: string) => {
  const roleText = role ? `<p style="font-size: 14px; color: #9ca3af; margin-top: 8px;">Rol: ${role}</p>` : '';
  
  return Swal.fire({
    html: `
      <div class="welcome-alert-container">
        <div class="welcome-alert-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                  fill="url(#gradient1)" stroke="url(#gradient2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2 class="welcome-alert-title">Hoş Geldiniz!</h2>
        <p class="welcome-alert-username">${userName}</p>
        ${roleText}
        <div class="welcome-alert-message">
          Başarıyla giriş yaptınız. Sistem yükleniyor...
        </div>
      </div>
    `,
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    position: 'center',
    allowOutsideClick: true,
    allowEscapeKey: true,
    allowEnterKey: true,
    backdrop: false,  // Disable backdrop to prevent blocking
    focusConfirm: false,
    focusCancel: false,
    focusDeny: false,
    customClass: {
      popup: 'welcome-alert-popup',
      timerProgressBar: 'welcome-alert-progress'
    },
    showClass: {
      popup: 'welcome-alert-show'
    },
    hideClass: {
      popup: 'welcome-alert-hide'
    }
  });
};

export default showApiResponse;