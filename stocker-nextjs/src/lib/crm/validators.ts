// Email validator
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validator (Turkish format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
  const cleaned = phone.replace(/\D/g, '');
  return phoneRegex.test(cleaned);
}

// Required field validator
export function isRequired(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

// Number range validator
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// URL validator
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Tax ID validator (Turkish VKN/TCKN)
export function isValidTaxId(taxId: string): boolean {
  const cleaned = taxId.replace(/\D/g, '');
  // VKN is 10 digits, TCKN is 11 digits
  return cleaned.length === 10 || cleaned.length === 11;
}

// Form validation rules for Ant Design
export const ValidationRules = {
  required: (message: string = 'Bu alan zorunludur') => ({
    required: true,
    message,
  }),
  email: (message: string = 'Geçerli bir e-posta adresi giriniz') => ({
    type: 'email' as const,
    message,
  }),
  phone: (message: string = 'Geçerli bir telefon numarası giriniz') => ({
    pattern: /^(\+90|0)?[0-9]{10}$/,
    message,
  }),
  url: (message: string = 'Geçerli bir URL giriniz') => ({
    type: 'url' as const,
    message,
  }),
  minLength: (min: number, message?: string) => ({
    min,
    message: message || `En az ${min} karakter olmalıdır`,
  }),
  maxLength: (max: number, message?: string) => ({
    max,
    message: message || `En fazla ${max} karakter olmalıdır`,
  }),
  range: (min: number, max: number, message?: string) => ({
    type: 'number' as const,
    min,
    max,
    message: message || `${min} ile ${max} arasında bir değer giriniz`,
  }),
};
