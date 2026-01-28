import jsPDF from 'jspdf';
import type { Invoice, InvoiceItem } from '../api/services/invoice.service';
import type { SalesOrder, SalesOrderItem, Quotation, QuotationItem } from '../api/services/sales.service';

// =====================================
// PDF EXPORT UTILITIES
// =====================================

interface PDFConfig {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyTaxNumber?: string;
  logoUrl?: string;
}

const defaultConfig: PDFConfig = {
  companyName: 'Stocker',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  companyTaxNumber: '',
};

// Turkish character transliteration for PDF (jsPDF default font doesn't support Turkish chars)
const turkishToAscii = (text: string): string => {
  if (!text) return '';
  const charMap: Record<string, string> = {
    'ş': 's', 'Ş': 'S',
    'ğ': 'g', 'Ğ': 'G',
    'ü': 'u', 'Ü': 'U',
    'ö': 'o', 'Ö': 'O',
    'ı': 'i', 'İ': 'I',
    'ç': 'c', 'Ç': 'C',
  };
  return text.replace(/[şŞğĞüÜöÖıİçÇ]/g, (char) => charMap[char] || char);
};

// Format currency for PDF (without currency symbol to avoid encoding issues)
const formatCurrency = (amount: number, currency: string = 'TRY'): string => {
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  return `${formatted} ${currency}`;
};

// Format date for Turkish locale
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('tr-TR');
};

// =====================================
// INVOICE PDF EXPORT
// =====================================

export async function generateInvoicePDF(
  invoice: Invoice,
  config: PDFConfig = defaultConfig
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Helper to safely add text with Turkish char conversion
  const t = turkishToAscii;

  // Header - Company Info
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(t(config.companyName || 'Stocker'), margin, y);
  y += 10;

  if (config.companyAddress) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(t(config.companyAddress), margin, y);
    y += 5;
  }

  // Invoice Title
  y += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const invoiceTitle = invoice.type === 'Sales' ? 'SATIS FATURASI' :
                       invoice.type === 'Return' ? 'IADE FATURASI' :
                       invoice.type === 'Credit' ? 'ALACAK DEKONTU' : 'BORC DEKONTU';
  doc.text(invoiceTitle, pageWidth - margin, y, { align: 'right' });

  // Invoice Details Box
  y += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Left side - Customer Info
  doc.setFont('helvetica', 'bold');
  doc.text('Musteri Bilgileri:', margin, y);
  doc.setFont('helvetica', 'normal');
  y += 6;
  doc.text(t(invoice.customerName || ''), margin, y);
  y += 5;
  if (invoice.customerTaxNumber) {
    doc.text(`VKN: ${invoice.customerTaxNumber}`, margin, y);
    y += 5;
  }
  if (invoice.customerAddress) {
    const addressLines = doc.splitTextToSize(t(invoice.customerAddress), 80);
    doc.text(addressLines, margin, y);
    y += addressLines.length * 5;
  }
  if (invoice.customerEmail) {
    doc.text(`E-posta: ${invoice.customerEmail}`, margin, y);
  }

  // Right side - Invoice Info
  const rightX = pageWidth - margin - 60;
  let rightY = y - 25;
  doc.setFont('helvetica', 'bold');
  doc.text('Fatura No:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoiceNumber, rightX + 35, rightY);
  rightY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Fatura Tarihi:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(invoice.invoiceDate), rightX + 35, rightY);
  rightY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Vade Tarihi:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(invoice.dueDate || ''), rightX + 35, rightY);
  rightY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Durum:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  const statusText = getInvoiceStatusText(invoice.status);
  doc.text(statusText, rightX + 35, rightY);

  // Items Table
  y = Math.max(y, rightY) + 20;

  // Table Header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  const colWidths = [60, 15, 20, 25, 15, 20, 20];
  let colX = margin;

  doc.text('Urun', colX + 2, y);
  colX += colWidths[0];
  doc.text('Birim', colX, y);
  colX += colWidths[1];
  doc.text('Miktar', colX, y);
  colX += colWidths[2];
  doc.text('Birim Fiyat', colX, y);
  colX += colWidths[3];
  doc.text('KDV%', colX, y);
  colX += colWidths[4];
  doc.text('KDV', colX, y);
  colX += colWidths[5];
  doc.text('Toplam', colX, y);

  y += 8;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  invoice.items.forEach((item: InvoiceItem) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    colX = margin;
    const productText = doc.splitTextToSize(t(`${item.productCode} - ${item.productName}`), colWidths[0] - 4);
    doc.text(productText, colX + 2, y);
    const rowHeight = productText.length > 1 ? productText.length * 4 : 5;

    colX += colWidths[0];
    doc.text(t(item.unit), colX, y);
    colX += colWidths[1];
    doc.text(item.quantity.toString(), colX, y);
    colX += colWidths[2];
    doc.text(formatCurrency(item.unitPrice, invoice.currency), colX, y);
    colX += colWidths[3];
    doc.text(`%${item.vatRate}`, colX, y);
    colX += colWidths[4];
    doc.text(formatCurrency(item.vatAmount, invoice.currency), colX, y);
    colX += colWidths[5];
    doc.text(formatCurrency(item.lineTotal, invoice.currency), colX, y);

    y += rowHeight + 3;
  });

  // Totals
  y += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(pageWidth - margin - 70, y, pageWidth - margin, y);
  y += 8;

  const totalsX = pageWidth - margin - 70;

  doc.setFont('helvetica', 'normal');
  doc.text('Ara Toplam:', totalsX, y);
  doc.text(formatCurrency(invoice.subTotal, invoice.currency), pageWidth - margin, y, { align: 'right' });
  y += 6;

  if (invoice.discountAmount > 0) {
    doc.text('Indirim:', totalsX, y);
    doc.text(`-${formatCurrency(invoice.discountAmount, invoice.currency)}`, pageWidth - margin, y, { align: 'right' });
    y += 6;
  }

  doc.text('KDV Toplami:', totalsX, y);
  doc.text(formatCurrency(invoice.vatAmount, invoice.currency), pageWidth - margin, y, { align: 'right' });
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Genel Toplam:', totalsX, y);
  doc.text(formatCurrency(invoice.totalAmount, invoice.currency), pageWidth - margin, y, { align: 'right' });

  if (invoice.paidAmount > 0) {
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Odenen:', totalsX, y);
    doc.text(formatCurrency(invoice.paidAmount, invoice.currency), pageWidth - margin, y, { align: 'right' });
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Kalan Borc:', totalsX, y);
    doc.text(formatCurrency(invoice.remainingAmount, invoice.currency), pageWidth - margin, y, { align: 'right' });
  }

  // Notes
  if (invoice.notes) {
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Notlar:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(t(invoice.notes), pageWidth - margin * 2);
    doc.text(notesLines, margin, y);
  }


  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Olusturulma: ${new Date().toLocaleString('tr-TR')}`, margin, footerY);
  doc.text('Stocker - Stok ve Satis Yonetim Sistemi', pageWidth - margin, footerY, { align: 'right' });

  // Save
  doc.save(`Fatura_${invoice.invoiceNumber}.pdf`);
}

// =====================================
// SALES ORDER PDF EXPORT
// =====================================

export async function generateSalesOrderPDF(
  order: SalesOrder,
  config: PDFConfig = defaultConfig
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Helper to safely add text with Turkish char conversion
  const t = turkishToAscii;

  // Header - Company Info
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(t(config.companyName || 'Stocker'), margin, y);
  y += 10;

  if (config.companyAddress) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(t(config.companyAddress), margin, y);
    y += 5;
  }

  // Order Title
  y += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SATIS SIPARISI', pageWidth - margin, y, { align: 'right' });

  // Order Details Box
  y += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Left side - Customer Info
  doc.setFont('helvetica', 'bold');
  doc.text('Musteri Bilgileri:', margin, y);
  doc.setFont('helvetica', 'normal');
  y += 6;
  doc.text(t(order.customerName || ''), margin, y);
  y += 5;
  if (order.customerEmail) {
    doc.text(`E-posta: ${order.customerEmail}`, margin, y);
    y += 5;
  }
  if (order.shippingAddress) {
    doc.text('Teslimat Adresi:', margin, y);
    y += 5;
    const addressLines = doc.splitTextToSize(t(order.shippingAddress), 80);
    doc.text(addressLines, margin, y);
    y += addressLines.length * 5;
  }

  // Right side - Order Info
  const rightX = pageWidth - margin - 60;
  let rightY = y - 25;
  doc.setFont('helvetica', 'bold');
  doc.text('Siparis No:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(order.orderNumber, rightX + 35, rightY);
  rightY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Siparis Tarihi:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(order.orderDate), rightX + 35, rightY);
  rightY += 6;

  if (order.deliveryDate) {
    doc.setFont('helvetica', 'bold');
    doc.text('Teslimat Tarihi:', rightX, rightY);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(order.deliveryDate), rightX + 35, rightY);
    rightY += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Durum:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  const statusText = getOrderStatusText(order.status);
  doc.text(statusText, rightX + 35, rightY);

  if (order.salesPersonName) {
    rightY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Satis Temsilcisi:', rightX, rightY);
    doc.setFont('helvetica', 'normal');
    doc.text(t(order.salesPersonName), rightX + 35, rightY);
  }

  // Items Table
  y = Math.max(y, rightY) + 20;

  // Table Header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  const colWidths = [60, 15, 20, 25, 15, 20, 20];
  let colX = margin;

  doc.text('Urun', colX + 2, y);
  colX += colWidths[0];
  doc.text('Birim', colX, y);
  colX += colWidths[1];
  doc.text('Miktar', colX, y);
  colX += colWidths[2];
  doc.text('Birim Fiyat', colX, y);
  colX += colWidths[3];
  doc.text('KDV%', colX, y);
  colX += colWidths[4];
  doc.text('KDV', colX, y);
  colX += colWidths[5];
  doc.text('Toplam', colX, y);

  y += 8;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  order.items.forEach((item: SalesOrderItem) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    colX = margin;
    const productText = doc.splitTextToSize(t(`${item.productCode} - ${item.productName}`), colWidths[0] - 4);
    doc.text(productText, colX + 2, y);
    const rowHeight = productText.length > 1 ? productText.length * 4 : 5;

    colX += colWidths[0];
    doc.text(t(item.unit), colX, y);
    colX += colWidths[1];
    doc.text(item.quantity.toString(), colX, y);
    colX += colWidths[2];
    doc.text(formatCurrency(item.unitPrice, order.currency), colX, y);
    colX += colWidths[3];
    doc.text(`%${item.vatRate}`, colX, y);
    colX += colWidths[4];
    doc.text(formatCurrency(item.vatAmount, order.currency), colX, y);
    colX += colWidths[5];
    doc.text(formatCurrency(item.lineTotal, order.currency), colX, y);

    y += rowHeight + 3;
  });

  // Totals
  y += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(pageWidth - margin - 70, y, pageWidth - margin, y);
  y += 8;

  const totalsX = pageWidth - margin - 70;

  doc.setFont('helvetica', 'normal');
  doc.text('Ara Toplam:', totalsX, y);
  doc.text(formatCurrency(order.subTotal, order.currency), pageWidth - margin, y, { align: 'right' });
  y += 6;

  if (order.discountAmount > 0) {
    doc.text('Indirim:', totalsX, y);
    doc.text(`-${formatCurrency(order.discountAmount, order.currency)}`, pageWidth - margin, y, { align: 'right' });
    y += 6;
  }

  doc.text('KDV Toplami:', totalsX, y);
  doc.text(formatCurrency(order.vatAmount, order.currency), pageWidth - margin, y, { align: 'right' });
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Genel Toplam:', totalsX, y);
  doc.text(formatCurrency(order.totalAmount, order.currency), pageWidth - margin, y, { align: 'right' });

  // Notes
  if (order.notes) {
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Notlar:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(t(order.notes), pageWidth - margin * 2);
    doc.text(notesLines, margin, y);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Olusturulma: ${new Date().toLocaleString('tr-TR')}`, margin, footerY);
  doc.text('Stocker - Stok ve Satis Yonetim Sistemi', pageWidth - margin, footerY, { align: 'right' });

  // Save
  doc.save(`Siparis_${order.orderNumber}.pdf`);
}

// =====================================
// HELPER FUNCTIONS
// =====================================

function getInvoiceStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    Draft: 'Taslak',
    Issued: 'Kesilmis',
    Sent: 'Gonderildi',
    PartiallyPaid: 'Kismi Odenmis',
    Paid: 'Odenmis',
    Overdue: 'Vadesi Gecmis',
    Cancelled: 'Iptal',
  };
  return statusMap[status] || status;
}

function getOrderStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    Draft: 'Taslak',
    Approved: 'Onayli',
    Confirmed: 'Onaylandi',
    Shipped: 'Gonderildi',
    Delivered: 'Teslim Edildi',
    Completed: 'Tamamlandi',
    Cancelled: 'Iptal',
  };
  return statusMap[status] || status;
}

function getQuotationStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    Draft: 'Taslak',
    PendingApproval: 'Onay Bekliyor',
    Approved: 'Onayli',
    Sent: 'Gonderildi',
    Accepted: 'Kabul Edildi',
    Rejected: 'Reddedildi',
    Expired: 'Suresi Doldu',
    Cancelled: 'Iptal',
    ConvertedToOrder: 'Siparise Donusturuldu',
  };
  return statusMap[status] || status;
}

// =====================================
// QUOTATION PDF EXPORT
// =====================================

export async function generateQuotationPDF(
  quotation: Quotation,
  config: PDFConfig = defaultConfig
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Helper to safely add text with Turkish char conversion
  const t = turkishToAscii;

  // Safe number formatting
  const safeNumber = (val: unknown): number => {
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Header - Company Info
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(t(config.companyName || 'Stocker'), margin, y);

  // Quotation Title on right
  doc.setFontSize(14);
  doc.text('FIYAT TEKLIFI', pageWidth - margin, y, { align: 'right' });
  y += 12;

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Two column layout for info
  const leftColX = margin;
  const rightColX = pageWidth / 2 + 10;
  let leftY = y;
  let rightY = y;

  // Left Column - Customer Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('MUSTERI BILGILERI', leftColX, leftY);
  leftY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  if (quotation.customerName) {
    doc.text(t(quotation.customerName), leftColX, leftY);
    leftY += 5;
  }
  if (quotation.customerEmail) {
    doc.text(`E-posta: ${quotation.customerEmail}`, leftColX, leftY);
    leftY += 5;
  }
  if (quotation.customerPhone) {
    doc.text(`Tel: ${quotation.customerPhone}`, leftColX, leftY);
    leftY += 5;
  }
  if (quotation.contactName) {
    doc.text(`Ilgili: ${t(quotation.contactName)}`, leftColX, leftY);
    leftY += 5;
  }

  // Right Column - Quotation Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TEKLIF BILGILERI', rightColX, rightY);
  rightY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  doc.text(`Teklif No: ${quotation.quotationNumber || '-'}`, rightColX, rightY);
  rightY += 5;
  doc.text(`Tarih: ${quotation.quotationDate ? formatDate(quotation.quotationDate) : '-'}`, rightColX, rightY);
  rightY += 5;

  const expDate = quotation.expirationDate || quotation.validUntil;
  if (expDate) {
    doc.text(`Gecerlilik: ${formatDate(expDate)}`, rightColX, rightY);
    rightY += 5;
  }

  doc.text(`Durum: ${getQuotationStatusText(quotation.status)}`, rightColX, rightY);
  rightY += 5;

  if (quotation.salesPersonName) {
    doc.text(`Temsilci: ${t(quotation.salesPersonName)}`, rightColX, rightY);
    rightY += 5;
  }

  // Move to after both columns
  y = Math.max(leftY, rightY) + 10;

  // Items Table - Simplified columns that fit
  // Urun | Miktar | Birim Fiyat | Toplam
  const colWidths = [80, 25, 35, 35]; // Total: 175, fits in ~180 content width
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const tableStartX = margin;

  // Table Header
  doc.setFillColor(66, 66, 66);
  doc.rect(tableStartX, y - 4, tableWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);

  let colX = tableStartX;
  doc.text('Urun', colX + 2, y);
  colX += colWidths[0];
  doc.text('Miktar', colX + 2, y);
  colX += colWidths[1];
  doc.text('Birim Fiyat', colX + 2, y);
  colX += colWidths[2];
  doc.text('Toplam', colX + 2, y);

  y += 6;
  doc.setTextColor(0, 0, 0);

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const items = quotation.items || [];
  items.forEach((item: QuotationItem, index: number) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(tableStartX, y - 3, tableWidth, 6, 'F');
    }

    colX = tableStartX;

    // Product name (with code if exists)
    const productName = item.productName || 'Urun';
    const productCode = item.productCode ? `${item.productCode} - ` : '';
    const productText = doc.splitTextToSize(t(`${productCode}${productName}`), colWidths[0] - 4);
    doc.text(productText[0] || '', colX + 2, y); // Only first line to prevent overflow

    colX += colWidths[0];
    // Quantity with unit
    const qty = safeNumber(item.quantity);
    const unit = item.unit ? ` ${t(item.unit)}` : '';
    doc.text(`${qty}${unit}`, colX + 2, y);

    colX += colWidths[1];
    // Unit price
    const unitPrice = safeNumber(item.unitPrice);
    doc.text(formatCurrency(unitPrice, quotation.currency || 'TRY'), colX + 2, y);

    colX += colWidths[2];
    // Line total
    const lineTotal = safeNumber(item.lineTotal);
    doc.text(formatCurrency(lineTotal, quotation.currency || 'TRY'), colX + 2, y);

    y += 6;
  });

  // Table bottom line
  doc.setDrawColor(66, 66, 66);
  doc.line(tableStartX, y, tableStartX + tableWidth, y);
  y += 8;

  // Totals section - right aligned
  const totalsX = pageWidth - margin - 80;
  doc.setFontSize(9);

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.text('Ara Toplam:', totalsX, y);
  doc.text(formatCurrency(safeNumber(quotation.subTotal), quotation.currency || 'TRY'), pageWidth - margin, y, { align: 'right' });
  y += 5;

  // Discount if exists
  const discountAmount = safeNumber(quotation.discountAmount);
  if (discountAmount > 0) {
    doc.text('Indirim:', totalsX, y);
    doc.text(`-${formatCurrency(discountAmount, quotation.currency || 'TRY')}`, pageWidth - margin, y, { align: 'right' });
    y += 5;
  }

  // VAT
  const vatAmount = safeNumber(quotation.vatAmount) || safeNumber(quotation.taxAmount) || safeNumber(quotation.taxTotal);
  doc.text('KDV:', totalsX, y);
  doc.text(formatCurrency(vatAmount, quotation.currency || 'TRY'), pageWidth - margin, y, { align: 'right' });
  y += 6;

  // Grand Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const totalAmount = safeNumber(quotation.totalAmount) || safeNumber(quotation.grandTotal);
  doc.text('GENEL TOPLAM:', totalsX, y);
  doc.text(formatCurrency(totalAmount, quotation.currency || 'TRY'), pageWidth - margin, y, { align: 'right' });
  y += 10;

  // Terms & Conditions
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  if (quotation.paymentTerms) {
    doc.text(`Odeme Kosullari: ${t(quotation.paymentTerms)}`, margin, y);
    y += 4;
  }
  if (quotation.deliveryTerms) {
    doc.text(`Teslimat Kosullari: ${t(quotation.deliveryTerms)}`, margin, y);
    y += 4;
  }

  // Notes
  if (quotation.notes) {
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Notlar:', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(t(quotation.notes), contentWidth);
    doc.text(notesLines, margin, y);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(7);
  doc.setTextColor(128, 128, 128);
  doc.text(`Olusturulma: ${new Date().toLocaleString('tr-TR')}`, margin, footerY);
  doc.text('Stocker - Stok ve Satis Yonetim Sistemi', pageWidth - margin, footerY, { align: 'right' });

  // Save
  doc.save(`Teklif_${quotation.quotationNumber}.pdf`);
}

export { type PDFConfig };
