import { Rule } from 'antd/lib/form';

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Turkish format)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
  const cleaned = phone.replace(/[\s()-]/g, '');
  return phoneRegex.test(cleaned);
};

// Password validation
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('En az 8 karakter olmalıdır');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('En az bir büyük harf içermelidir');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('En az bir küçük harf içermelidir');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('En az bir rakam içermelidir');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('En az bir özel karakter içermelidir');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Turkish ID validation (TC Kimlik No)
export const validateTurkishId = (id: string): boolean => {
  if (!id || id.length !== 11) return false;
  
  const digits = id.split('').map(Number);
  
  if (digits[0] === 0) return false;
  
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  
  const tenthDigit = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
  const eleventhDigit = (digits.slice(0, 10).reduce((a, b) => a + b, 0) % 10);
  
  return digits[9] === tenthDigit && digits[10] === eleventhDigit;
};

// URL validation
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Ant Design Form Rules
export const formRules = {
  required: (message = 'Bu alan zorunludur'): Rule => ({
    required: true,
    message,
  }),
  
  email: (message = 'Geçerli bir email adresi giriniz'): Rule => ({
    type: 'email',
    message,
  }),
  
  phone: (message = 'Geçerli bir telefon numarası giriniz'): Rule => ({
    validator: (_, value) => {
      if (!value || validatePhone(value)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    },
  }),
  
  password: (): Rule => ({
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      
      const { isValid, errors } = validatePassword(value);
      if (isValid) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(errors.join(', ')));
    },
  }),
  
  confirmPassword: (passwordFieldName = 'password'): Rule => ({
    validator: (rule, value) => {
      const form = (rule as any).field?.split('.').reduce((acc: any, key: string) => {
        return acc?.[key];
      }, (rule as any).form);
      
      if (!value || form?.getFieldValue(passwordFieldName) === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Şifreler eşleşmiyor'));
    },
  }),
  
  min: (min: number, message?: string): Rule => ({
    min,
    message: message || `En az ${min} karakter olmalıdır`,
  }),
  
  max: (max: number, message?: string): Rule => ({
    max,
    message: message || `En fazla ${max} karakter olabilir`,
  }),
  
  number: (message = 'Sayı giriniz'): Rule => ({
    pattern: /^[0-9]+$/,
    message,
  }),
  
  decimal: (message = 'Geçerli bir sayı giriniz'): Rule => ({
    pattern: /^[0-9]+(\.[0-9]+)?$/,
    message,
  }),
  
  url: (message = 'Geçerli bir URL giriniz'): Rule => ({
    validator: (_, value) => {
      if (!value || validateUrl(value)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    },
  }),
  
  turkishId: (message = 'Geçerli bir TC Kimlik No giriniz'): Rule => ({
    validator: (_, value) => {
      if (!value || validateTurkishId(value)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    },
  }),
};

// Input sanitizers
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export const sanitizeNumber = (input: string): string => {
  return input.replace(/[^0-9.-]/g, '');
};

export const sanitizePhone = (input: string): string => {
  return input.replace(/[^0-9+()-\s]/g, '');
};