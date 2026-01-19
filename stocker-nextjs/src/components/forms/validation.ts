import type { Rule } from 'antd/es/form';

/**
 * Common validation rules for form fields
 */

// Email validation
export const emailRule: Rule = {
  type: 'email',
  message: 'Geçerli bir e-posta adresi girin',
};

// URL validation
export const urlRule: Rule = {
  type: 'url',
  message: 'Geçerli bir URL girin (https:// ile başlamalı)',
};

// Phone validation (Turkey format)
export const phoneRule: Rule = {
  pattern: /^(\+90|0)?[0-9]{10}$/,
  message: 'Geçerli bir telefon numarası girin',
};

// Positive number validation
export const positiveNumberRule: Rule = {
  type: 'number',
  min: 0,
  message: 'Değer 0 veya daha büyük olmalıdır',
};

// Max length validation factory
export const maxLengthRule = (max: number): Rule => ({
  max,
  message: `En fazla ${max} karakter olabilir`,
});

// Min length validation factory
export const minLengthRule = (min: number): Rule => ({
  min,
  message: `En az ${min} karakter olmalıdır`,
});

// Pattern validation factory
export const patternRule = (pattern: RegExp, message: string): Rule => ({
  pattern,
  message,
});

// Code/SKU format validation (alphanumeric with dashes)
export const codeFormatRule: Rule = {
  pattern: /^[A-Za-z0-9\-_]+$/,
  message: 'Sadece harf, rakam, tire ve alt çizgi kullanılabilir',
};

// Barcode validation (numeric, typically 8-14 digits)
export const barcodeRule: Rule = {
  pattern: /^[0-9]{8,14}$/,
  message: 'Barkod 8-14 haneli sayısal olmalıdır',
};

// Tax number validation (Turkey - 10 digits for companies, 11 for individuals)
export const taxNumberRule: Rule = {
  pattern: /^[0-9]{10,11}$/,
  message: 'Vergi numarası 10 veya 11 haneli olmalıdır',
};

// IBAN validation (Turkey format)
export const ibanRule: Rule = {
  pattern: /^TR[0-9]{2}[0-9]{4}[0-9A-Z]{16}$/,
  message: 'Geçerli bir IBAN girin (TR ile başlamalı, 26 karakter)',
};

// Date comparison validation factory
export const dateAfterRule = (fieldName: string, fieldLabel: string): Rule => ({
  validator: async (_, value) => {
    // This needs to be used with form.getFieldValue in the component
    // This is a placeholder structure
    if (!value) return Promise.resolve();
    return Promise.resolve();
  },
  message: `Bu tarih ${fieldLabel} tarihinden sonra olmalıdır`,
});

// Required rule with custom message
export const requiredRule = (fieldLabel: string): Rule => ({
  required: true,
  message: `${fieldLabel} zorunludur`,
});

// Whitespace validation (no empty strings)
export const noWhitespaceRule: Rule = {
  whitespace: true,
  message: 'Bu alan boş bırakılamaz',
};

/**
 * Common validation rule sets
 */

export const nameFieldRules = (fieldLabel: string = 'Bu alan'): Rule[] => [
  requiredRule(fieldLabel),
  maxLengthRule(200),
  noWhitespaceRule,
];

export const codeFieldRules = (fieldLabel: string = 'Kod'): Rule[] => [
  requiredRule(fieldLabel),
  codeFormatRule,
  maxLengthRule(50),
];

export const emailFieldRules = (required: boolean = false): Rule[] => [
  ...(required ? [requiredRule('E-posta')] : []),
  emailRule,
];

export const urlFieldRules = (required: boolean = false): Rule[] => [
  ...(required ? [requiredRule('URL')] : []),
  urlRule,
];

export const phoneFieldRules = (required: boolean = false): Rule[] => [
  ...(required ? [requiredRule('Telefon')] : []),
  phoneRule,
];

export const priceFieldRules = (required: boolean = false): Rule[] => [
  ...(required ? [requiredRule('Fiyat')] : []),
  positiveNumberRule,
];

export const quantityFieldRules = (required: boolean = false): Rule[] => [
  ...(required ? [requiredRule('Miktar')] : []),
  positiveNumberRule,
];
