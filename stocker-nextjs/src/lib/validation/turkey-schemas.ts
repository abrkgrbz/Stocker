import { z } from 'zod';

/**
 * Turkish TC Identity Number Validation
 * 11 digits, specific checksum algorithm
 */
export const tcIdentitySchema = z
  .string()
  .length(11, 'TC Kimlik No 11 haneli olmalıdır')
  .regex(/^\d{11}$/, 'TC Kimlik No sadece rakamlardan oluşmalıdır')
  .refine((value) => value[0] !== '0', 'TC Kimlik No 0 ile başlayamaz')
  .refine(
    (value) => {
      // TC Kimlik checksum algorithm
      const digits = value.split('').map(Number);

      // 10th digit check
      const odd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
      const even = digits[1] + digits[3] + digits[5] + digits[7];
      const tenth = ((odd * 7) - even) % 10;

      if (digits[9] !== tenth) return false;

      // 11th digit check
      const sum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
      const eleventh = sum % 10;

      return digits[10] === eleventh;
    },
    'Geçersiz TC Kimlik No'
  );

/**
 * Turkish Tax ID (Vergi Kimlik No) Validation
 * 10 digits for companies, 11 digits (TC) for individuals
 */
export const taxIdSchema = z
  .string()
  .min(10, 'Vergi No en az 10 haneli olmalıdır')
  .max(11, 'Vergi No en fazla 11 haneli olmalıdır')
  .regex(/^\d{10,11}$/, 'Vergi No sadece rakamlardan oluşmalıdır')
  .refine(
    (value) => {
      if (value.length === 11) {
        // For 11 digits, validate as TC Identity
        return tcIdentitySchema.safeParse(value).success;
      }

      // For 10 digits (company tax ID), basic validation
      const v = parseInt(value, 10);
      return v >= 1000000000 && v <= 9999999999;
    },
    'Geçersiz Vergi Kimlik No'
  );

/**
 * Turkish IBAN Validation
 * TR followed by 24 digits
 */
export const ibanSchema = z
  .string()
  .toUpperCase()
  .regex(/^TR\d{24}$/, 'IBAN formatı: TR + 24 rakam')
  .refine(
    (value) => {
      // IBAN checksum validation (mod-97 algorithm)
      const rearranged = value.slice(4) + value.slice(0, 4);
      const numericString = rearranged
        .split('')
        .map((char) => {
          const code = char.charCodeAt(0);
          return code >= 65 && code <= 90 ? code - 55 : char;
        })
        .join('');

      let remainder = BigInt(numericString) % 97n;
      return remainder === 1n;
    },
    'Geçersiz IBAN numarası'
  );

/**
 * Turkish Phone Number Validation
 * Mobile: 5XX XXX XX XX
 * Landline: 2XX XXX XX XX or 3XX XXX XX XX or 4XX XXX XX XX
 */
export const phoneSchema = z
  .string()
  .transform((val) => val.replace(/\s+/g, '').replace(/[()-]/g, ''))
  .pipe(
    z
      .string()
      .regex(/^(\+90|0)?[2-5]\d{9}$/, 'Geçersiz telefon numarası')
      .transform((val) => {
        // Normalize to +90XXXXXXXXXX format
        if (val.startsWith('+90')) return val;
        if (val.startsWith('0')) return '+90' + val.slice(1);
        return '+90' + val;
      })
  );

/**
 * Turkish Mobile Phone Validation (only mobile numbers)
 */
export const mobilePhoneSchema = z
  .string()
  .transform((val) => val.replace(/\s+/g, '').replace(/[()-]/g, ''))
  .pipe(
    z
      .string()
      .regex(/^(\+90|0)?5\d{9}$/, 'Geçersiz cep telefonu numarası')
      .transform((val) => {
        if (val.startsWith('+90')) return val;
        if (val.startsWith('0')) return '+90' + val.slice(1);
        return '+90' + val;
      })
  );

/**
 * Turkish Postal Code Validation
 * 5 digits
 */
export const postalCodeSchema = z
  .string()
  .length(5, 'Posta kodu 5 haneli olmalıdır')
  .regex(/^\d{5}$/, 'Posta kodu sadece rakamlardan oluşmalıdır');

/**
 * Common Business Schemas
 */

// Company name
export const companyNameSchema = z
  .string()
  .min(2, 'Firma adı en az 2 karakter olmalıdır')
  .max(200, 'Firma adı en fazla 200 karakter olmalıdır')
  .regex(/^[a-zA-ZğüşöçİĞÜŞÖÇ0-9\s.,&()-]+$/, 'Geçersiz firma adı karakterleri');

// Person name
export const personNameSchema = z
  .string()
  .min(2, 'İsim en az 2 karakter olmalıdır')
  .max(100, 'İsim en fazla 100 karakter olmalıdır')
  .regex(/^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/, 'İsim sadece harflerden oluşmalıdır');

// Email
export const emailSchema = z
  .string()
  .min(1, 'E-posta adresi gereklidir')
  .email('Geçerli bir e-posta adresi girin')
  .max(254, 'E-posta adresi çok uzun');

// Currency (Turkish Lira)
export const currencySchema = z
  .string()
  .regex(/^\d+([.,]\d{1,2})?$/, 'Geçerli bir tutar girin')
  .transform((val) => parseFloat(val.replace(',', '.')))
  .pipe(z.number().min(0, 'Tutar negatif olamaz'));

// Percentage
export const percentageSchema = z
  .string()
  .regex(/^\d+([.,]\d{1,2})?$/, 'Geçerli bir yüzde değeri girin')
  .transform((val) => parseFloat(val.replace(',', '.')))
  .pipe(
    z
      .number()
      .min(0, 'Yüzde 0\'dan küçük olamaz')
      .max(100, 'Yüzde 100\'den büyük olamaz')
  );

// Quantity
export const quantitySchema = z
  .string()
  .regex(/^\d+([.,]\d{1,3})?$/, 'Geçerli bir miktar girin')
  .transform((val) => parseFloat(val.replace(',', '.')))
  .pipe(z.number().min(0, 'Miktar negatif olamaz'));

/**
 * Helper function to format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('90')) {
    const national = cleaned.slice(2);
    return `+90 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6, 8)} ${national.slice(8)}`;
  }

  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }

  return phone;
}

/**
 * Helper function to format IBAN for display
 */
export function formatIBAN(iban: string): string {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
}

/**
 * Helper function to format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Helper function to format percentage for display
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value / 100);
}
