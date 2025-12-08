/**
 * Excel/CSV Export Utilities
 */

export interface ExportColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => string;
}

/**
 * Export data to CSV format
 */
export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create header row
  const header = columns.map(col => `"${col.title}"`).join(',');

  // Create data rows
  const rows = data.map(record => {
    return columns.map(col => {
      const value = getNestedValue(record, col.key as string);
      const displayValue = col.render ? col.render(value, record) : formatValue(value);
      // Escape quotes and wrap in quotes
      return `"${String(displayValue).replace(/"/g, '""')}"`;
    }).join(',');
  });

  // Combine header and rows
  const csvContent = [header, ...rows].join('\n');

  // Add BOM for UTF-8 encoding (for Turkish characters)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Download file
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data to Excel format (XLSX)
 */
export async function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName: string = 'Sheet1'
): Promise<void> {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Dynamically import xlsx library
  const XLSX = await import('xlsx');

  // Prepare data for Excel
  const excelData = data.map(record => {
    const row: Record<string, any> = {};
    columns.forEach(col => {
      const value = getNestedValue(record, col.key as string);
      row[col.title] = col.render ? col.render(value, record) : formatValue(value);
    });
    return row;
  });

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-size columns
  const maxWidths = columns.map((col, index) => {
    const maxDataWidth = Math.max(
      ...excelData.map(row => String(row[col.title] || '').length),
      col.title.length
    );
    return { wch: Math.min(maxDataWidth + 2, 50) };
  });
  worksheet['!cols'] = maxWidths;

  // Generate Excel file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Get nested object value by dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Format value for display
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır';
  if (value instanceof Date) return value.toLocaleDateString('tr-TR');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for export
 */
export function formatDateForExport(date: string | Date | undefined | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR');
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(amount: number | undefined | null, currency: string = 'TRY'): string {
  if (amount === null || amount === undefined) return '';
  return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${currency}`;
}
