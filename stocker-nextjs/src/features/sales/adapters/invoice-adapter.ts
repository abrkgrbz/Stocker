/**
 * Invoice Adapter Layer
 *
 * Backend DTO'ları ile frontend arasındaki alan eşlemelerini yönetir.
 * Backend property isimleri İngilizce kalır, frontend'de Türkçe label'lar
 * bu adapter üzerinden sağlanır.
 *
 * Backend DTO Referansı: InvoiceDto.cs
 */

import type { Invoice as BackendInvoice, InvoiceListItem as BackendInvoiceListItem } from '../types';

// =====================================
// BACKEND → FRONTEND MAPPING
// =====================================

/**
 * Backend'den gelen Invoice DTO'yu frontend'in beklediği formata dönüştürür.
 * invoice.service.ts'deki eski field isimleri (taxTotal, grandTotal, balanceDue)
 * artık backend isimleriyle (vatAmount, totalAmount, remainingAmount) eşlenir.
 */
export function mapBackendInvoice(backendData: Record<string, unknown>): BackendInvoice {
  return {
    id: backendData.id as string,
    invoiceNumber: backendData.invoiceNumber as string,
    invoiceDate: backendData.invoiceDate as string,
    dueDate: backendData.dueDate as string | undefined,
    salesOrderId: backendData.salesOrderId as string | undefined,
    customerId: backendData.customerId as string | undefined,
    customerName: backendData.customerName as string | undefined,
    customerEmail: backendData.customerEmail as string | undefined,
    customerTaxNumber: backendData.customerTaxNumber as string | undefined,
    customerAddress: backendData.customerAddress as string | undefined,
    subTotal: backendData.subTotal as number,
    discountAmount: backendData.discountAmount as number,
    discountRate: backendData.discountRate as number,
    // Backend field → Frontend field (doğrudan eşleme)
    vatAmount: backendData.vatAmount as number,
    totalAmount: backendData.totalAmount as number,
    paidAmount: backendData.paidAmount as number,
    remainingAmount: backendData.remainingAmount as number,
    currency: backendData.currency as string,
    exchangeRate: backendData.exchangeRate as number,
    status: backendData.status as string,
    type: backendData.type as string,
    notes: backendData.notes as string | undefined,
    // E-Fatura / E-Arşiv
    eInvoiceId: backendData.eInvoiceId as string | undefined,
    isEInvoice: backendData.isEInvoice as boolean,
    eInvoiceDate: backendData.eInvoiceDate as string | undefined,
    gibUuid: backendData.gibUuid as string | undefined,
    eInvoiceStatus: backendData.eInvoiceStatus as string | undefined,
    eInvoiceErrorMessage: backendData.eInvoiceErrorMessage as string | undefined,
    isEArchive: backendData.isEArchive as boolean,
    eArchiveNumber: backendData.eArchiveNumber as string | undefined,
    eArchiveDate: backendData.eArchiveDate as string | undefined,
    eArchiveStatus: backendData.eArchiveStatus as string | undefined,
    // Tevkifat
    hasWithholdingTax: backendData.hasWithholdingTax as boolean,
    withholdingTaxRate: backendData.withholdingTaxRate as number,
    withholdingTaxAmount: backendData.withholdingTaxAmount as number,
    withholdingTaxCode: backendData.withholdingTaxCode as string | undefined,
    // Fatura Numaralama
    invoiceSeries: backendData.invoiceSeries as string | undefined,
    sequenceNumber: backendData.sequenceNumber as number,
    invoiceYear: backendData.invoiceYear as number,
    // Müşteri Vergi Bilgileri
    customerTaxIdType: backendData.customerTaxIdType as string | undefined,
    customerTaxOfficeCode: backendData.customerTaxOfficeCode as string | undefined,
    customerPhone: backendData.customerPhone as string | undefined,
    customerTaxOffice: backendData.customerTaxOffice as string | undefined,
    // Kaynak Belge İlişkileri
    salesOrderNumber: backendData.salesOrderNumber as string | undefined,
    shipmentId: backendData.shipmentId as string | undefined,
    shipmentNumber: backendData.shipmentNumber as string | undefined,
    deliveryNoteId: backendData.deliveryNoteId as string | undefined,
    deliveryNoteNumber: backendData.deliveryNoteNumber as string | undefined,
    quotationId: backendData.quotationId as string | undefined,
    // Billing Address Snapshot
    billingAddressSnapshot: backendData.billingAddressSnapshot as BackendInvoice['billingAddressSnapshot'],
    // Timestamps
    createdAt: backendData.createdAt as string,
    updatedAt: backendData.updatedAt as string | undefined,
    items: (backendData.items as unknown[])?.map(mapBackendInvoiceItem) ?? [],
  };
}

function mapBackendInvoiceItem(item: unknown): BackendInvoice['items'][0] {
  const data = item as Record<string, unknown>;
  return {
    id: data.id as string,
    invoiceId: data.invoiceId as string,
    salesOrderItemId: data.salesOrderItemId as string | undefined,
    productId: data.productId as string | undefined,
    productCode: data.productCode as string,
    productName: data.productName as string,
    description: data.description as string | undefined,
    unit: data.unit as string,
    quantity: data.quantity as number,
    unitPrice: data.unitPrice as number,
    discountRate: data.discountRate as number,
    discountAmount: data.discountAmount as number,
    vatRate: data.vatRate as number,
    vatAmount: data.vatAmount as number,
    lineTotal: data.lineTotal as number,
    lineNumber: data.lineNumber as number,
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string | undefined,
  };
}

/**
 * Backend'den gelen InvoiceListItem'ı frontend formatına dönüştürür
 */
export function mapBackendInvoiceListItem(backendData: Record<string, unknown>): BackendInvoiceListItem {
  return {
    id: backendData.id as string,
    invoiceNumber: backendData.invoiceNumber as string,
    invoiceDate: backendData.invoiceDate as string,
    dueDate: backendData.dueDate as string | undefined,
    customerId: backendData.customerId as string | undefined,
    customerName: backendData.customerName as string | undefined,
    totalAmount: backendData.totalAmount as number,
    paidAmount: backendData.paidAmount as number,
    remainingAmount: backendData.remainingAmount as number,
    currency: backendData.currency as string,
    status: backendData.status as string,
    type: backendData.type as string,
    isEInvoice: backendData.isEInvoice as boolean,
    itemCount: backendData.itemCount as number,
    createdAt: backendData.createdAt as string,
  };
}

// =====================================
// TÜRKÇE LABEL MAPPING
// =====================================

/**
 * Backend field isimlerinin Türkçe karşılıkları (UI gösterimi için)
 */
export const invoiceFieldLabels: Record<string, string> = {
  // Tutar Alanları
  subTotal: 'Ara Toplam',
  vatAmount: 'KDV Tutarı',
  totalAmount: 'Genel Toplam',
  remainingAmount: 'Kalan Tutar',
  paidAmount: 'Ödenen Tutar',
  discountAmount: 'İskonto Tutarı',
  discountRate: 'İskonto Oranı (%)',
  exchangeRate: 'Döviz Kuru',

  // Tevkifat
  hasWithholdingTax: 'Tevkifat Uygulanıyor',
  withholdingTaxRate: 'Tevkifat Oranı',
  withholdingTaxAmount: 'Tevkifat Tutarı',
  withholdingTaxCode: 'Tevkifat Kodu',

  // E-Belge
  isEInvoice: 'E-Fatura',
  eInvoiceId: 'E-Fatura No',
  eInvoiceDate: 'E-Fatura Tarihi',
  eInvoiceStatus: 'E-Fatura Durumu',
  gibUuid: 'GİB UUID',
  isEArchive: 'E-Arşiv',
  eArchiveNumber: 'E-Arşiv No',
  eArchiveDate: 'E-Arşiv Tarihi',
  eArchiveStatus: 'E-Arşiv Durumu',

  // Fatura Bilgileri
  invoiceNumber: 'Fatura No',
  invoiceDate: 'Fatura Tarihi',
  dueDate: 'Vade Tarihi',
  invoiceSeries: 'Fatura Serisi',
  sequenceNumber: 'Sıra No',
  invoiceYear: 'Fatura Yılı',
  status: 'Durum',
  type: 'Fatura Tipi',
  currency: 'Para Birimi',
  notes: 'Notlar',

  // Müşteri Bilgileri
  customerName: 'Müşteri Adı',
  customerEmail: 'E-Posta',
  customerPhone: 'Telefon',
  customerTaxNumber: 'Vergi / TC No',
  customerTaxOffice: 'Vergi Dairesi',
  customerTaxIdType: 'Vergi No Tipi',
  customerTaxOfficeCode: 'Vergi Dairesi Kodu',
  customerAddress: 'Adres',

  // Kaynak Belgeler
  salesOrderNumber: 'Sipariş No',
  shipmentNumber: 'Sevkiyat No',
  deliveryNoteNumber: 'İrsaliye No',
};

/**
 * Invoice Status Türkçe karşılıkları
 */
export const invoiceStatusLabels: Record<string, string> = {
  Draft: 'Taslak',
  Issued: 'Düzenlendi',
  Sent: 'Gönderildi',
  PartiallyPaid: 'Kısmen Ödendi',
  Paid: 'Ödendi',
  Overdue: 'Vadesi Geçmiş',
  Cancelled: 'İptal Edildi',
  Voided: 'Hükümsüz',
};

/**
 * Invoice Type Türkçe karşılıkları
 */
export const invoiceTypeLabels: Record<string, string> = {
  Sales: 'Satış Faturası',
  Return: 'İade Faturası',
  Credit: 'Alacak Dekontu',
  Debit: 'Borç Dekontu',
  Proforma: 'Proforma Fatura',
  Advance: 'Avans Faturası',
  Export: 'İhracat Faturası',
};

/**
 * E-Fatura Status Türkçe karşılıkları
 */
export const eInvoiceStatusLabels: Record<string, string> = {
  Pending: 'Beklemede',
  Sending: 'Gönderiliyor',
  Sent: 'Gönderildi',
  Accepted: 'Kabul Edildi',
  Rejected: 'Reddedildi',
  Error: 'Hata',
};

/**
 * E-Arşiv Status Türkçe karşılıkları
 */
export const eArchiveStatusLabels: Record<string, string> = {
  Pending: 'Beklemede',
  Created: 'Oluşturuldu',
  Signed: 'İmzalandı',
  Sent: 'Gönderildi',
  Error: 'Hata',
};

/**
 * TaxIdType Türkçe karşılıkları
 */
export const taxIdTypeLabels: Record<string, string> = {
  VKN: 'Vergi Kimlik No (Tüzel Kişi)',
  TCKN: 'TC Kimlik No (Gerçek Kişi)',
  Foreign: 'Yabancı Vergi No',
};

/**
 * Tevkifat Kodları ve Açıklamaları
 */
export const withholdingTaxCodes: Record<string, string> = {
  '601': 'Yapım İşleri ile Mühendislik-Mimarlık',
  '602': 'Etüt, Plan-Proje, Danışmanlık, Denetim',
  '603': 'Makine, Teçhizat Tadil, Bakım ve Onarım',
  '604': 'Yemek Servis ve Organizasyon',
  '605': 'İşgücü Temin Hizmetleri',
  '606': 'Yapı Denetim Hizmetleri',
  '607': 'Fason Tekstil ve Konfeksiyon İşleri',
  '608': 'Turistik Mağaza Müşteri Bulma',
  '609': 'Spor Kulübü Yayın, Reklam Gelirleri',
  '610': 'Temizlik, Çevre ve Bahçe Bakım',
  '611': 'Taşımacılık Hizmetleri',
  '612': 'Baskı ve Basım Hizmetleri',
  '613': 'Diğer Hizmetler',
  '614': 'Kamu Özel İş Birliği Sağlık Tesisleri',
  '615': 'Ticari Reklam Hizmetleri',
};

/**
 * Geçerli tevkifat oranları
 */
export const validWithholdingRates = [
  { value: 20, label: '2/10' },
  { value: 30, label: '3/10' },
  { value: 50, label: '5/10' },
  { value: 70, label: '7/10' },
  { value: 90, label: '9/10' },
];

/**
 * Geçerli Türkiye KDV oranları
 */
export const validVatRates = [
  { value: 0, label: '%0 (İhracat / Muaf)' },
  { value: 1, label: '%1' },
  { value: 5, label: '%5' },
  { value: 8, label: '%8' },
  { value: 10, label: '%10' },
  { value: 20, label: '%20 (Standart)' },
];

// =====================================
// LEGACY ADAPTER (Geçiş Dönemi)
// =====================================

/**
 * Eski invoice.service.ts formatından yeni formata dönüştürür.
 * Bu fonksiyon geçiş döneminde kullanılır ve eski field isimlerini
 * yeni backend isimleriyle eşler.
 *
 * Eski: taxTotal, grandTotal, balanceDue
 * Yeni: vatAmount, totalAmount, remainingAmount
 */
export function mapLegacyInvoiceFields(legacyData: Record<string, unknown>): Record<string, unknown> {
  return {
    ...legacyData,
    // Eski isimleri yeni isimlere dönüştür
    vatAmount: legacyData.taxTotal ?? legacyData.vatAmount,
    totalAmount: legacyData.grandTotal ?? legacyData.totalAmount,
    remainingAmount: legacyData.balanceDue ?? legacyData.remainingAmount,
    // Eski alanları temizle
    taxTotal: undefined,
    grandTotal: undefined,
    balanceDue: undefined,
  };
}
