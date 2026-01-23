import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { ProductDto } from '@/lib/api/services/inventory.types';

export interface InventoryExportOptions {
  title?: string;
  includeInactive?: boolean;
  columns?: string[];
}

const defaultColumns = [
  'code',
  'name',
  'categoryName',
  'brandName',
  'productType',
  'unitPrice',
  'totalStockQuantity',
  'availableStockQuantity',
  'minStockLevel',
  'isActive',
];

const columnLabels: Record<string, string> = {
  code: 'Ürün Kodu',
  name: 'Ürün Adı',
  barcode: 'Barkod',
  categoryName: 'Kategori',
  brandName: 'Marka',
  productType: 'Tür',
  unitPrice: 'Birim Fiyat',
  unitPriceCurrency: 'Para Birimi',
  totalStockQuantity: 'Toplam Stok',
  availableStockQuantity: 'Kullanılabilir Stok',
  reservedStockQuantity: 'Rezerve Stok',
  minStockLevel: 'Min. Stok Seviyesi',
  maxStockLevel: 'Max. Stok Seviyesi',
  reorderPoint: 'Yeniden Sipariş Noktası',
  isActive: 'Durum',
  description: 'Açıklama',
};

const productTypeLabels: Record<string, string> = {
  Raw: 'Hammadde',
  SemiFinished: 'Yarı Mamul',
  Finished: 'Mamul',
  Service: 'Hizmet',
  Consumable: 'Sarf Malzeme',
  FixedAsset: 'Duran Varlık',
};

/**
 * Transliterate Turkish characters to ASCII equivalents for PDF compatibility.
 * jsPDF standard fonts (Helvetica, Courier, Times) do not support Turkish chars.
 */
function transliterateTurkish(text: string): string {
  const map: Record<string, string> = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
  };
  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, (char) => map[char] || char);
}

function formatCellValue(key: string, value: any): string {
  if (value === null || value === undefined) return '-';

  switch (key) {
    case 'isActive':
      return value ? 'Aktif' : 'Pasif';
    case 'productType':
      return productTypeLabels[value] || value;
    case 'unitPrice':
      return typeof value === 'number' ? `₺${value.toLocaleString('tr-TR')}` : '-';
    case 'totalStockQuantity':
    case 'availableStockQuantity':
    case 'reservedStockQuantity':
    case 'minStockLevel':
    case 'maxStockLevel':
    case 'reorderPoint':
      return typeof value === 'number' ? value.toLocaleString('tr-TR') : '-';
    default:
      return String(value);
  }
}

export function generateInventoryPDF(
  products: ProductDto[],
  options: InventoryExportOptions = {}
): void {
  const {
    title = 'Envanter Raporu',
    columns = defaultColumns,
  } = options;

  const doc = new jsPDF('l', 'mm', 'a4');

  // Title
  doc.setFontSize(18);
  doc.text(transliterateTurkish(title), 14, 22);

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(transliterateTurkish(`Olusturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`), 14, 30);
  doc.text(transliterateTurkish(`Toplam Urun: ${products.length}`), 14, 36);

  // Calculate totals
  const totalValue = products.reduce((sum, p) => sum + (p.unitPrice || 0) * p.totalStockQuantity, 0);
  const totalStock = products.reduce((sum, p) => sum + p.totalStockQuantity, 0);
  const lowStockCount = products.filter((p) => p.totalStockQuantity < p.minStockLevel).length;

  doc.text(transliterateTurkish(`Toplam Stok Degeri: TL ${totalValue.toLocaleString('tr-TR')}`), 100, 30);
  doc.text(transliterateTurkish(`Toplam Stok Miktari: ${totalStock.toLocaleString('tr-TR')}`), 100, 36);
  doc.text(transliterateTurkish(`Dusuk Stoklu Urun: ${lowStockCount}`), 200, 30);

  // Prepare table data - transliterate all text for PDF font compatibility
  const headers = columns.map((col) => transliterateTurkish(columnLabels[col] || col));
  const data = products.map((product) =>
    columns.map((col) => transliterateTurkish(formatCellValue(col, (product as any)[col])))
  );

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 42,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 25 }, // code
      1: { cellWidth: 50 }, // name
      5: { halign: 'right' }, // unitPrice
      6: { halign: 'right' }, // totalStockQuantity
      7: { halign: 'right' }, // availableStockQuantity
      8: { halign: 'right' }, // minStockLevel
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Sayfa ${i} / ${pageCount}`,  // "Sayfa" has no special chars
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Download
  const filename = `envanter-raporu-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

export function exportInventoryToExcel(
  products: ProductDto[],
  options: InventoryExportOptions = {}
): void {
  const {
    title = 'Envanter Raporu',
    columns = defaultColumns,
  } = options;

  // Prepare data with Turkish column names
  const headers = columns.map((col) => columnLabels[col] || col);
  const data = products.map((product) => {
    const row: Record<string, any> = {};
    columns.forEach((col, index) => {
      row[headers[index]] = formatCellValue(col, (product as any)[col]);
    });
    return row;
  });

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Main data sheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = columns.map((col) => {
    switch (col) {
      case 'name':
      case 'description':
        return { wch: 40 };
      case 'code':
      case 'barcode':
        return { wch: 20 };
      default:
        return { wch: 15 };
    }
  });
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');

  // Summary sheet
  const totalValue = products.reduce((sum, p) => sum + (p.unitPrice || 0) * p.totalStockQuantity, 0);
  const totalStock = products.reduce((sum, p) => sum + p.totalStockQuantity, 0);
  const activeCount = products.filter((p) => p.isActive).length;
  const lowStockCount = products.filter((p) => p.totalStockQuantity < p.minStockLevel).length;

  const summaryData = [
    { Metrik: 'Toplam Ürün Sayısı', Değer: products.length },
    { Metrik: 'Aktif Ürün Sayısı', Değer: activeCount },
    { Metrik: 'Pasif Ürün Sayısı', Değer: products.length - activeCount },
    { Metrik: 'Düşük Stoklu Ürün', Değer: lowStockCount },
    { Metrik: 'Toplam Stok Miktarı', Değer: totalStock },
    { Metrik: 'Toplam Stok Değeri', Değer: `₺${totalValue.toLocaleString('tr-TR')}` },
    { Metrik: 'Rapor Tarihi', Değer: new Date().toLocaleDateString('tr-TR') },
  ];

  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 25 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Özet');

  // Category breakdown sheet
  const categoryMap = new Map<string, { count: number; value: number; stock: number }>();
  products.forEach((p) => {
    const cat = p.categoryName || 'Kategorisiz';
    const existing = categoryMap.get(cat) || { count: 0, value: 0, stock: 0 };
    existing.count++;
    existing.value += (p.unitPrice || 0) * p.totalStockQuantity;
    existing.stock += p.totalStockQuantity;
    categoryMap.set(cat, existing);
  });

  const categoryData = Array.from(categoryMap.entries()).map(([name, data]) => ({
    Kategori: name,
    'Ürün Sayısı': data.count,
    'Toplam Stok': data.stock,
    'Stok Değeri': `₺${data.value.toLocaleString('tr-TR')}`,
  }));

  const categoryWs = XLSX.utils.json_to_sheet(categoryData);
  categoryWs['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, categoryWs, 'Kategori Dağılımı');

  // Download
  const filename = `envanter-raporu-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// Export selected products
export function exportSelectedProducts(
  products: ProductDto[],
  selectedIds: number[],
  format: 'pdf' | 'excel',
  options: InventoryExportOptions = {}
): void {
  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

  if (selectedProducts.length === 0) {
    throw new Error('Seçili ürün bulunamadı');
  }

  if (format === 'pdf') {
    generateInventoryPDF(selectedProducts, {
      ...options,
      title: options.title || `Seçili Ürünler (${selectedProducts.length} adet)`,
    });
  } else {
    exportInventoryToExcel(selectedProducts, {
      ...options,
      title: options.title || `Seçili Ürünler (${selectedProducts.length} adet)`,
    });
  }
}

// Low stock report
export function generateLowStockReport(products: ProductDto[], format: 'pdf' | 'excel'): void {
  const lowStockProducts = products.filter((p) => p.totalStockQuantity < p.minStockLevel);

  if (lowStockProducts.length === 0) {
    throw new Error('Düşük stoklu ürün bulunamadı');
  }

  const columns = [
    'code',
    'name',
    'categoryName',
    'totalStockQuantity',
    'minStockLevel',
    'availableStockQuantity',
    'unitPrice',
  ];

  const options: InventoryExportOptions = {
    title: 'Düşük Stok Raporu',
    columns,
  };

  if (format === 'pdf') {
    generateInventoryPDF(lowStockProducts, options);
  } else {
    exportInventoryToExcel(lowStockProducts, options);
  }
}
