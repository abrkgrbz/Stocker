import { z } from 'zod';

// Email validation
export const emailSchema = z
    .string()
    .min(1, 'E-posta zorunludur')
    .email('Geçerli bir e-posta adresi girin');

export const optionalEmailSchema = z
    .string()
    .email('Geçerli bir e-posta adresi girin')
    .optional()
    .or(z.literal(''));

// Phone validation (Turkish format: +90 5XX XXX XX XX)
export const phoneSchema = z
    .string()
    .regex(
        /^\+90 5\d{2} \d{3} \d{2} \d{2}$/,
        'Geçerli bir telefon numarası girin (+90 5XX XXX XX XX)'
    );

export const optionalPhoneSchema = z
    .string()
    .regex(
        /^\+90 5\d{2} \d{3} \d{2} \d{2}$/,
        'Geçerli bir telefon numarası girin (+90 5XX XXX XX XX)'
    )
    .optional()
    .or(z.literal(''));

// Required string validation
export const requiredString = (fieldName: string = 'Bu alan') =>
    z.string().min(1, `${fieldName} zorunludur`);

// Optional string (can be empty)
export const optionalString = z.string().optional().or(z.literal(''));

// Currency/money validation
export const currencySchema = z.coerce.number().min(0, 'Tutar negatif olamaz');

// Positive currency (must be > 0)
export const positiveCurrencySchema = z.coerce.number().positive('Tutar 0\'dan büyük olmalıdır');

// Quantity validation
export const quantitySchema = z
    .number()
    .int('Miktar tam sayı olmalıdır')
    .min(1, 'Miktar en az 1 olmalıdır');

// Percentage validation (0-100)
export const percentageSchema = z
    .number()
    .min(0, 'Yüzde 0\'dan küçük olamaz')
    .max(100, 'Yüzde 100\'den büyük olamaz');

// Date validation (ISO format: YYYY-MM-DD)
export const dateSchema = z.string().refine(
    (val) => {
        if (!val) return false;
        const date = new Date(val);
        return !isNaN(date.getTime());
    },
    { message: 'Geçerli bir tarih girin' }
);

export const optionalDateSchema = z
    .string()
    .refine(
        (val) => {
            if (!val) return true;
            const date = new Date(val);
            return !isNaN(date.getTime());
        },
        { message: 'Geçerli bir tarih girin' }
    )
    .optional()
    .or(z.literal(''));

// Future date validation
export const futureDateSchema = z.string().refine(
    (val) => {
        if (!val) return false;
        const date = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
    },
    { message: 'Tarih bugün veya sonrası olmalıdır' }
);

// Tax ID validation (Turkish VKN - 10 digits or TCKN - 11 digits)
export const taxIdSchema = z
    .string()
    .regex(/^\d{10,11}$/, 'Vergi numarası 10 veya 11 haneli olmalıdır')
    .optional()
    .or(z.literal(''));

// Postal code validation (Turkish: 5 digits)
export const postalCodeSchema = z
    .string()
    .regex(/^\d{5}$/, 'Posta kodu 5 haneli olmalıdır')
    .optional()
    .or(z.literal(''));

// Website URL validation
export const websiteSchema = z
    .string()
    .url('Geçerli bir URL girin (https://...)')
    .optional()
    .or(z.literal(''));

// ID validation (non-empty string)
export const idSchema = z.string().min(1, 'Seçim zorunludur');

export const optionalIdSchema = z.string().optional().or(z.literal(''));
