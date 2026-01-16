/**
 * Error Message Translations
 * Translates common backend error messages to Turkish
 */

// Common backend error messages and their Turkish translations
const errorTranslations: Record<string, string> = {
  // Customer errors
  'A customer with this email already exists': 'Bu e-posta adresi ile kayıtlı bir müşteri zaten var',
  'Customer not found': 'Müşteri bulunamadı',
  'Customer cannot be deleted': 'Müşteri silinemedi',
  'Invalid customer type': 'Geçersiz müşteri tipi',
  'Email is required': 'E-posta zorunludur',
  'Company name is required': 'Firma adı zorunludur',

  // Lead errors
  'A lead with this email already exists': 'Bu e-posta adresi ile kayıtlı bir lead zaten var',
  'Lead not found': 'Lead bulunamadı',
  'Lead cannot be converted': 'Lead dönüştürülemedi',
  'First name is required': 'Ad zorunludur',
  'Last name is required': 'Soyad zorunludur',

  // Deal errors
  'Deal not found': 'Fırsat bulunamadı',
  'Deal cannot be closed': 'Fırsat kapatılamadı',
  'Customer is required': 'Müşteri seçimi zorunludur',
  'Amount is required': 'Tutar zorunludur',
  'Pipeline is required': 'Pipeline seçimi zorunludur',
  'Stage is required': 'Aşama seçimi zorunludur',
  'Expected close date is required': 'Tahmini kapanış tarihi zorunludur',
  'Invalid deal status': 'Geçersiz fırsat durumu',

  // Campaign errors
  'Campaign not found': 'Kampanya bulunamadı',
  'Campaign name is required': 'Kampanya adı zorunludur',
  'Invalid campaign status': 'Geçersiz kampanya durumu',
  'A campaign with this name already exists': 'Bu isimle bir kampanya zaten var',

  // Pipeline errors
  'Pipeline not found': 'Pipeline bulunamadı',
  'Pipeline cannot be deleted': 'Pipeline silinemedi',
  'Stage not found': 'Aşama bulunamadı',

  // Activity errors
  'Activity not found': 'Aktivite bulunamadı',
  'Invalid activity type': 'Geçersiz aktivite tipi',

  // General errors
  'Unauthorized': 'Yetkisiz erişim',
  'Forbidden': 'Bu işlem için yetkiniz yok',
  'Not found': 'Bulunamadı',
  'Bad request': 'Geçersiz istek',
  'Internal server error': 'Sunucu hatası',
  'Network error': 'Ağ bağlantısı hatası',
  'Request timeout': 'İstek zaman aşımına uğradı',
  'Validation failed': 'Doğrulama hatası',
  'The request is invalid': 'İstek geçersiz',
  'One or more validation errors occurred': 'Bir veya daha fazla doğrulama hatası oluştu',

  // Auth errors
  'Invalid credentials': 'Geçersiz kimlik bilgileri',
  'Session expired': 'Oturum süresi doldu',
  'Token expired': 'Token süresi doldu',
  'Access denied': 'Erişim reddedildi',

  // File errors
  'File too large': 'Dosya çok büyük',
  'Invalid file type': 'Geçersiz dosya türü',
  'File upload failed': 'Dosya yüklemesi başarısız',

  // Duplicate errors
  'already exists': 'zaten mevcut',
  'duplicate': 'tekrarlayan kayıt',
};

/**
 * Translate backend error message to Turkish
 * @param message - Original error message from backend
 * @returns Translated message or original if no translation found
 */
export function translateError(message: string): string {
  if (!message) return 'Bir hata oluştu';

  // Check exact match first
  if (errorTranslations[message]) {
    return errorTranslations[message];
  }

  // Check partial matches (case-insensitive)
  const lowerMessage = message.toLowerCase();
  for (const [key, translation] of Object.entries(errorTranslations)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return translation;
    }
  }

  // Return original message if no translation found
  return message;
}

/**
 * Extract and translate error from API response
 * @param error - Error object from API call
 * @param fallbackMessage - Fallback message if extraction fails
 * @returns Translated error message
 */
export function getTranslatedApiError(error: any, fallbackMessage: string = 'İşlem başarısız'): string {
  // Try to extract error message from various response formats
  const message =
    error?.response?.data?.detail ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.response?.data?.title ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage;

  return translateError(message);
}
