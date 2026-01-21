/**
 * Generic Export Utilities for Stocker Application
 * Provides PDF and Excel export functionality for various data types
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

// ============================================
// Types
// ============================================

export interface ExportColumn<T = any> {
  key: keyof T | string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, record: T) => string;
}

export interface ExportOptions {
  title: string;
  filename?: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  summaryData?: Array<{ label: string; value: string | number }>;
  additionalSheets?: Array<{
    name: string;
    data: any[];
    columns?: ExportColumn[];
  }>;
}

export interface ExportConfig<T = any> {
  columns: ExportColumn<T>[];
  data: T[];
  options: ExportOptions;
}

// ============================================
// Formatters
// ============================================

export const formatters = {
  currency: (value: number | null | undefined, currency = 'TRY'): string => {
    if (value === null || value === undefined) return '-';
    const symbol = currency === 'TRY' ? '₺' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '';
    return `${symbol}${value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  number: (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('tr-TR');
  },

  date: (value: string | Date | null | undefined, format = 'DD/MM/YYYY'): string => {
    if (!value) return '-';
    return dayjs(value).format(format);
  },

  dateTime: (value: string | Date | null | undefined): string => {
    if (!value) return '-';
    return dayjs(value).format('DD/MM/YYYY HH:mm');
  },

  boolean: (value: boolean | null | undefined, trueLabel = 'Evet', falseLabel = 'Hayır'): string => {
    if (value === null || value === undefined) return '-';
    return value ? trueLabel : falseLabel;
  },

  status: (value: boolean | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return value ? 'Aktif' : 'Pasif';
  },

  percentage: (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return `%${value.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
  },

  default: (value: any): string => {
    if (value === null || value === undefined) return '-';
    return String(value);
  },
};

// ============================================
// Color Theme
// ============================================

const theme = {
  primary: [59, 130, 246] as [number, number, number], // Blue
  success: [34, 197, 94] as [number, number, number], // Green
  danger: [239, 68, 68] as [number, number, number], // Red
  warning: [245, 158, 11] as [number, number, number], // Orange
  secondary: [107, 114, 128] as [number, number, number], // Gray
  alternateRow: [245, 247, 250] as [number, number, number],
};

// ============================================
// PDF Export
// ============================================

function getCellValue<T>(record: T, column: ExportColumn<T>): string {
  const key = column.key as string;
  const value = key.includes('.')
    ? key.split('.').reduce((obj, k) => obj?.[k], record as any)
    : (record as any)[key];

  if (column.format) {
    return column.format(value, record);
  }
  return formatters.default(value);
}

export function exportToPDF<T>(config: ExportConfig<T>): void {
  const { columns, data, options } = config;
  const {
    title,
    filename = `rapor-${dayjs().format('YYYY-MM-DD')}`,
    subtitle,
    orientation = 'landscape',
    summaryData,
  } = options;

  const doc = new jsPDF(orientation === 'landscape' ? 'l' : 'p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text(title, 14, 20);

  // Subtitle and metadata
  let yPos = 28;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);

  if (subtitle) {
    doc.text(subtitle, 14, yPos);
    yPos += 6;
  }

  doc.text(`Oluşturulma Tarihi: ${dayjs().format('DD/MM/YYYY HH:mm')}`, 14, yPos);
  doc.text(`Toplam Kayıt: ${data.length}`, pageWidth / 2, yPos);
  yPos += 6;

  // Summary data
  if (summaryData && summaryData.length > 0) {
    const summaryPerRow = 3;
    const summaryWidth = (pageWidth - 28) / summaryPerRow;

    summaryData.forEach((item, index) => {
      const col = index % summaryPerRow;
      const row = Math.floor(index / summaryPerRow);
      const x = 14 + col * summaryWidth;
      const y = yPos + row * 6;

      doc.setTextColor(100, 116, 139);
      doc.text(`${item.label}: `, x, y);
      doc.setTextColor(30, 41, 59);
      doc.text(String(item.value), x + doc.getTextWidth(`${item.label}: `), y);
    });

    yPos += Math.ceil(summaryData.length / summaryPerRow) * 6 + 4;
  }

  // Prepare table data
  const headers = columns.map((col) => col.label);
  const tableData = data.map((record) =>
    columns.map((col) => getCellValue(record, col))
  );

  // Column styles
  const columnStyles: { [key: number]: { halign?: 'left' | 'center' | 'right'; cellWidth?: number } } = {};
  columns.forEach((col, index) => {
    if (col.align || col.width) {
      columnStyles[index] = {};
      if (col.align) columnStyles[index].halign = col.align;
      if (col.width) columnStyles[index].cellWidth = col.width;
    }
  });

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: yPos,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: theme.primary,
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: theme.alternateRow,
    },
    columnStyles,
  });

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Sayfa ${i} / ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Download
  doc.save(`${filename}.pdf`);
}

// ============================================
// Excel Export
// ============================================

export function exportToExcel<T>(config: ExportConfig<T>): void {
  const { columns, data, options } = config;
  const {
    title,
    filename = `rapor-${dayjs().format('YYYY-MM-DD')}`,
    summaryData,
    additionalSheets,
  } = options;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Main data sheet
  const headers = columns.map((col) => col.label);
  const tableData = data.map((record) => {
    const row: Record<string, any> = {};
    columns.forEach((col) => {
      row[col.label] = getCellValue(record, col);
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(tableData);

  // Set column widths
  const colWidths = columns.map((col) => ({
    wch: col.width ? Math.ceil(col.width / 3) : 15,
  }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31)); // Sheet name max 31 chars

  // Summary sheet
  if (summaryData && summaryData.length > 0) {
    const summarySheetData = [
      { Metrik: 'Rapor Başlığı', Değer: title },
      { Metrik: 'Toplam Kayıt', Değer: data.length },
      { Metrik: 'Oluşturulma Tarihi', Değer: dayjs().format('DD/MM/YYYY HH:mm') },
      ...summaryData.map((item) => ({ Metrik: item.label, Değer: item.value })),
    ];

    const summaryWs = XLSX.utils.json_to_sheet(summarySheetData);
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Özet');
  }

  // Additional sheets
  if (additionalSheets) {
    additionalSheets.forEach((sheet) => {
      let sheetData: any[];

      if (sheet.columns) {
        sheetData = sheet.data.map((record) => {
          const row: Record<string, any> = {};
          sheet.columns!.forEach((col) => {
            row[col.label] = getCellValue(record, col);
          });
          return row;
        });
      } else {
        sheetData = sheet.data;
      }

      const additionalWs = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, additionalWs, sheet.name.substring(0, 31));
    });
  }

  // Download
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// ============================================
// Predefined Column Configurations
// ============================================

// Stock Movement columns
export const stockMovementColumns: ExportColumn[] = [
  { key: 'documentNumber', label: 'Belge No', width: 40 },
  { key: 'movementDate', label: 'Tarih', width: 35, format: (v) => formatters.dateTime(v) },
  { key: 'movementType', label: 'Hareket Türü', width: 35 },
  { key: 'productCode', label: 'Ürün Kodu', width: 30 },
  { key: 'productName', label: 'Ürün Adı', width: 50 },
  { key: 'warehouseName', label: 'Depo', width: 30 },
  { key: 'quantity', label: 'Miktar', width: 25, align: 'right', format: (v) => formatters.number(v) },
  { key: 'unitCost', label: 'Birim Maliyet', width: 30, align: 'right', format: (v) => formatters.currency(v) },
  { key: 'totalCost', label: 'Toplam', width: 30, align: 'right', format: (v) => formatters.currency(v) },
  { key: 'referenceDocumentNumber', label: 'Referans', width: 35 },
];

// Stock Transfer columns
export const stockTransferColumns: ExportColumn[] = [
  { key: 'transferNumber', label: 'Transfer No', width: 40 },
  { key: 'transferDate', label: 'Tarih', width: 30, format: (v) => formatters.date(v) },
  { key: 'transferType', label: 'Transfer Türü', width: 30 },
  { key: 'status', label: 'Durum', width: 30 },
  { key: 'sourceWarehouseName', label: 'Kaynak Depo', width: 35 },
  { key: 'destinationWarehouseName', label: 'Hedef Depo', width: 35 },
  { key: 'totalRequestedQuantity', label: 'Talep', width: 20, align: 'right', format: (v) => formatters.number(v) },
  { key: 'totalShippedQuantity', label: 'Sevk', width: 20, align: 'right', format: (v) => formatters.number(v) },
  { key: 'totalReceivedQuantity', label: 'Teslim', width: 20, align: 'right', format: (v) => formatters.number(v) },
];

// Stock Count columns
export const stockCountColumns: ExportColumn[] = [
  { key: 'countNumber', label: 'Sayım No', width: 40 },
  { key: 'countDate', label: 'Sayım Tarihi', width: 30, format: (v) => formatters.date(v) },
  { key: 'countType', label: 'Sayım Türü', width: 30 },
  { key: 'status', label: 'Durum', width: 30 },
  { key: 'warehouseName', label: 'Depo', width: 35 },
  { key: 'totalItems', label: 'Toplam Kalem', width: 25, align: 'right', format: (v) => formatters.number(v) },
  { key: 'countedItems', label: 'Sayılan', width: 25, align: 'right', format: (v) => formatters.number(v) },
  { key: 'itemsWithDifferenceCount', label: 'Farklı', width: 25, align: 'right', format: (v) => formatters.number(v) },
  { key: 'totalDifference', label: 'Net Fark', width: 25, align: 'right', format: (v) => formatters.number(v) },
];

// Stock Reservation columns
export const stockReservationColumns: ExportColumn[] = [
  { key: 'reservationNumber', label: 'Rezervasyon No', width: 40 },
  { key: 'reservationDate', label: 'Tarih', width: 30, format: (v) => formatters.date(v) },
  { key: 'status', label: 'Durum', width: 25 },
  { key: 'productCode', label: 'Ürün Kodu', width: 30 },
  { key: 'productName', label: 'Ürün Adı', width: 50 },
  { key: 'warehouseName', label: 'Depo', width: 30 },
  { key: 'reservedQuantity', label: 'Rezerve', width: 25, align: 'right', format: (v) => formatters.number(v) },
  { key: 'fulfilledQuantity', label: 'Karşılanan', width: 25, align: 'right', format: (v) => formatters.number(v) },
  { key: 'expirationDate', label: 'Son Tarih', width: 30, format: (v) => formatters.date(v) },
];

// Supplier columns
export const supplierColumns: ExportColumn[] = [
  { key: 'code', label: 'Tedarikçi Kodu', width: 35 },
  { key: 'name', label: 'Tedarikçi Adı', width: 50 },
  { key: 'taxNumber', label: 'Vergi No', width: 30 },
  { key: 'contactPerson', label: 'İletişim Kişisi', width: 35 },
  { key: 'phone', label: 'Telefon', width: 30 },
  { key: 'email', label: 'E-posta', width: 40 },
  { key: 'city', label: 'Şehir', width: 25 },
  { key: 'paymentTermDays', label: 'Vade (Gün)', width: 25, align: 'right', format: (v) => formatters.number(v) },
  { key: 'creditLimit', label: 'Kredi Limiti', width: 30, align: 'right', format: (v) => formatters.currency(v) },
  { key: 'isActive', label: 'Durum', width: 20, format: (v) => formatters.status(v) },
];

// Warehouse columns
export const warehouseColumns: ExportColumn[] = [
  { key: 'code', label: 'Depo Kodu', width: 30 },
  { key: 'name', label: 'Depo Adı', width: 40 },
  { key: 'warehouseType', label: 'Depo Türü', width: 30 },
  { key: 'address', label: 'Adres', width: 60 },
  { key: 'city', label: 'Şehir', width: 25 },
  { key: 'phone', label: 'Telefon', width: 30 },
  { key: 'capacity', label: 'Kapasite', width: 25, align: 'right', format: (v) => formatters.number(v) },
  { key: 'isDefault', label: 'Varsayılan', width: 25, format: (v) => formatters.boolean(v) },
  { key: 'isActive', label: 'Durum', width: 20, format: (v) => formatters.status(v) },
];

// Category columns
export const categoryColumns: ExportColumn[] = [
  { key: 'code', label: 'Kategori Kodu', width: 35 },
  { key: 'name', label: 'Kategori Adı', width: 50 },
  { key: 'parentCategoryName', label: 'Üst Kategori', width: 40 },
  { key: 'displayOrder', label: 'Sıra', width: 20, align: 'right', format: (v) => formatters.number(v) },
  { key: 'description', label: 'Açıklama', width: 60 },
  { key: 'isActive', label: 'Durum', width: 20, format: (v) => formatters.status(v) },
];

// Brand columns
export const brandColumns: ExportColumn[] = [
  { key: 'code', label: 'Marka Kodu', width: 35 },
  { key: 'name', label: 'Marka Adı', width: 50 },
  { key: 'description', label: 'Açıklama', width: 60 },
  { key: 'website', label: 'Web Sitesi', width: 50 },
  { key: 'isActive', label: 'Durum', width: 20, format: (v) => formatters.status(v) },
];

// Unit columns
export const unitColumns: ExportColumn[] = [
  { key: 'code', label: 'Birim Kodu', width: 30 },
  { key: 'name', label: 'Birim Adı', width: 40 },
  { key: 'symbol', label: 'Sembol', width: 20 },
  { key: 'baseUnitName', label: 'Temel Birim', width: 30 },
  { key: 'conversionFactor', label: 'Dönüşüm Faktörü', width: 30, align: 'right', format: (v) => formatters.number(v) },
  { key: 'isActive', label: 'Durum', width: 20, format: (v) => formatters.status(v) },
];

// Lot Batch columns
export const lotBatchColumns: ExportColumn[] = [
  { key: 'lotNumber', label: 'Lot No', width: 35 },
  { key: 'productCode', label: 'Ürün Kodu', width: 30 },
  { key: 'productName', label: 'Ürün Adı', width: 50 },
  { key: 'status', label: 'Durum', width: 25 },
  { key: 'warehouseName', label: 'Depo', width: 30 },
  { key: 'quantity', label: 'Miktar', width: 25, align: 'right', format: (v) => formatters.number(v) },
  { key: 'manufacturingDate', label: 'Üretim Tarihi', width: 30, format: (v) => formatters.date(v) },
  { key: 'expirationDate', label: 'Son Kullanma', width: 30, format: (v) => formatters.date(v) },
];

// Serial Number columns
export const serialNumberColumns: ExportColumn[] = [
  { key: 'serialNumber', label: 'Seri No', width: 40 },
  { key: 'productCode', label: 'Ürün Kodu', width: 30 },
  { key: 'productName', label: 'Ürün Adı', width: 50 },
  { key: 'status', label: 'Durum', width: 25 },
  { key: 'warehouseName', label: 'Depo', width: 30 },
  { key: 'locationName', label: 'Konum', width: 30 },
  { key: 'receivedDate', label: 'Alım Tarihi', width: 30, format: (v) => formatters.date(v) },
  { key: 'warrantyEndDate', label: 'Garanti Bitiş', width: 30, format: (v) => formatters.date(v) },
];

// Price List columns
export const priceListColumns: ExportColumn[] = [
  { key: 'code', label: 'Liste Kodu', width: 30 },
  { key: 'name', label: 'Liste Adı', width: 50 },
  { key: 'currency', label: 'Para Birimi', width: 25 },
  { key: 'validFrom', label: 'Geçerlilik Başlangıç', width: 35, format: (v) => formatters.date(v) },
  { key: 'validTo', label: 'Geçerlilik Bitiş', width: 35, format: (v) => formatters.date(v) },
  { key: 'isDefault', label: 'Varsayılan', width: 25, format: (v) => formatters.boolean(v) },
  { key: 'isActive', label: 'Durum', width: 20, format: (v) => formatters.status(v) },
];

// ============================================
// Movement Type Labels
// ============================================

export const movementTypeLabels: Record<string, string> = {
  Purchase: 'Satın Alma',
  Sales: 'Satış',
  PurchaseReturn: 'Satın Alma İadesi',
  SalesReturn: 'Satış İadesi',
  Transfer: 'Transfer',
  Production: 'Üretim',
  Consumption: 'Tüketim',
  AdjustmentIncrease: 'Artış Düzeltme',
  AdjustmentDecrease: 'Azalış Düzeltme',
  Opening: 'Açılış',
  Counting: 'Sayım',
  Damage: 'Hasar',
  Loss: 'Kayıp',
  Found: 'Bulunan',
};

// Transfer Status Labels
export const transferStatusLabels: Record<string, string> = {
  Draft: 'Taslak',
  Pending: 'Beklemede',
  Approved: 'Onaylı',
  Rejected: 'Reddedildi',
  InTransit: 'Yolda',
  Received: 'Teslim Alındı',
  PartiallyReceived: 'Kısmi Teslim',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
};

// Transfer Type Labels
export const transferTypeLabels: Record<string, string> = {
  Standard: 'Standart',
  Urgent: 'Acil',
  Replenishment: 'İkmal',
  Return: 'İade',
  Internal: 'Dahili',
  CrossDock: 'Cross-Dock',
  Consolidation: 'Konsolidasyon',
};

// Stock Count Status Labels
export const stockCountStatusLabels: Record<string, string> = {
  Draft: 'Taslak',
  InProgress: 'Devam Ediyor',
  Completed: 'Tamamlandı',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Adjusted: 'Düzeltildi',
  Cancelled: 'İptal',
};

// Stock Count Type Labels
export const stockCountTypeLabels: Record<string, string> = {
  Full: 'Tam Sayım',
  Cycle: 'Periyodik Sayım',
  Spot: 'Anlık Sayım',
  Annual: 'Yıllık Sayım',
  Category: 'Kategori Sayımı',
  Location: 'Lokasyon Sayımı',
  ABC: 'ABC Sayımı',
  Perpetual: 'Sürekli Sayım',
};

// Reservation Status Labels
export const reservationStatusLabels: Record<string, string> = {
  Active: 'Aktif',
  PartiallyFulfilled: 'Kısmi Karşılandı',
  Fulfilled: 'Karşılandı',
  Expired: 'Süresi Doldu',
  Cancelled: 'İptal',
};

// Lot Batch Status Labels
export const lotBatchStatusLabels: Record<string, string> = {
  Available: 'Kullanılabilir',
  Reserved: 'Rezerve',
  Quarantine: 'Karantina',
  Expired: 'Süresi Dolmuş',
  Consumed: 'Tüketildi',
};

// Serial Number Status Labels
export const serialNumberStatusLabels: Record<string, string> = {
  Available: 'Kullanılabilir',
  Reserved: 'Rezerve',
  Sold: 'Satıldı',
  InWarranty: 'Garantide',
  Defective: 'Arızalı',
  Scrapped: 'Hurda',
};
