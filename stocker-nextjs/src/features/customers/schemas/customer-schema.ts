import { z } from 'zod';
import {
  companyNameSchema,
  personNameSchema,
  emailSchema,
  phoneSchema,
  taxIdSchema,
  ibanSchema,
  postalCodeSchema,
} from '@/lib/validation/turkey-schemas';

export const customerSchema = z.object({
  // Basic Information
  type: z.enum(['individual', 'corporate'] as const).describe('Müşteri tipi seçiniz'),

  // Individual fields
  firstName: z.string().optional(),
  lastName: z.string().optional(),

  // Corporate fields
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  taxOffice: z.string().optional(),

  // Contact Information
  email: emailSchema,
  phone: phoneSchema,
  mobilePhone: phoneSchema.optional(),
  website: z.string().url('Geçerli bir web sitesi adresi girin').optional().or(z.literal('')),

  // Address
  address: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
  district: z.string().min(2, 'İlçe bilgisi gereklidir'),
  city: z.string().min(2, 'Şehir bilgisi gereklidir'),
  postalCode: postalCodeSchema,
  country: z.string().default('Türkiye'),

  // Financial Information
  iban: ibanSchema.optional().or(z.literal('')),
  creditLimit: z.number().min(0, 'Kredi limiti negatif olamaz').optional(),
  paymentTerm: z.enum(['immediate', '15-days', '30-days', '45-days', '60-days', '90-days'] as const).describe('Ödeme vadesi seçiniz'),

  // Additional
  segment: z.enum(['retail', 'wholesale', 'corporate', 'vip'] as const).describe('Müşteri segmenti seçiniz'),
  status: z.enum(['active', 'inactive', 'blocked']).default('active'),
  notes: z.string().max(500, 'Notlar en fazla 500 karakter olabilir').optional(),
}).refine(
  (data) => {
    if (data.type === 'individual') {
      return !!data.firstName && !!data.lastName;
    }
    return true;
  },
  {
    message: 'Bireysel müşteri için ad ve soyad gereklidir',
    path: ['firstName'],
  }
).refine(
  (data) => {
    if (data.type === 'corporate') {
      return !!data.companyName && !!data.taxId;
    }
    return true;
  },
  {
    message: 'Kurumsal müşteri için firma adı ve vergi numarası gereklidir',
    path: ['companyName'],
  }
);

export type CustomerFormData = z.infer<typeof customerSchema>;
