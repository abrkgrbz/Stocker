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

// Format currency for Turkish locale
const formatCurrency = (amount: number, currency: string = 'TRY'): string => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
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

  // Header - Company Info
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(config.companyName || 'Stocker', margin, y);
  y += 10;

  if (config.companyAddress) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(config.companyAddress, margin, y);
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
  doc.text(invoice.customerName || '', margin, y);
  y += 5;
  if (invoice.customerTaxNumber) {
    doc.text(`VKN: ${invoice.customerTaxNumber}`, margin, y);
    y += 5;
  }
  if (invoice.customerAddress) {
    const addressLines = doc.splitTextToSize(invoice.customerAddress, 80);
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
    const productText = doc.splitTextToSize(`${item.productCode} - ${item.productName}`, colWidths[0] - 4);
    doc.text(productText, colX + 2, y);
    const rowHeight = productText.length > 1 ? productText.length * 4 : 5;

    colX += colWidths[0];
    doc.text(item.unit, colX, y);
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
    const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - margin * 2);
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

  // Header - Company Info
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(config.companyName || 'Stocker', margin, y);
  y += 10;

  if (config.companyAddress) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(config.companyAddress, margin, y);
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
  doc.text(order.customerName || '', margin, y);
  y += 5;
  if (order.customerEmail) {
    doc.text(`E-posta: ${order.customerEmail}`, margin, y);
    y += 5;
  }
  if (order.shippingAddress) {
    doc.text('Teslimat Adresi:', margin, y);
    y += 5;
    const addressLines = doc.splitTextToSize(order.shippingAddress, 80);
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
    doc.text(order.salesPersonName, rightX + 35, rightY);
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
    const productText = doc.splitTextToSize(`${item.productCode} - ${item.productName}`, colWidths[0] - 4);
    doc.text(productText, colX + 2, y);
    const rowHeight = productText.length > 1 ? productText.length * 4 : 5;

    colX += colWidths[0];
    doc.text(item.unit, colX, y);
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
    const notesLines = doc.splitTextToSize(order.notes, pageWidth - margin * 2);
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
  const margin = 20;
  let y = 20;

  // Header - Company Info
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(config.companyName || 'Stocker', margin, y);
  y += 10;

  if (config.companyAddress) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(config.companyAddress, margin, y);
    y += 5;
  }

  // Quotation Title
  y += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FIYAT TEKLIFI', pageWidth - margin, y, { align: 'right' });

  // Quotation Details Box
  y += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Left side - Customer Info
  doc.setFont('helvetica', 'bold');
  doc.text('Musteri Bilgileri:', margin, y);
  doc.setFont('helvetica', 'normal');
  y += 6;
  doc.text(quotation.customerName || '', margin, y);
  y += 5;
  if (quotation.customerEmail) {
    doc.text(`E-posta: ${quotation.customerEmail}`, margin, y);
    y += 5;
  }
  if (quotation.contactName) {
    doc.text(`Ilgili Kisi: ${quotation.contactName}`, margin, y);
    y += 5;
  }
  if (quotation.shippingAddress) {
    doc.text('Adres:', margin, y);
    y += 5;
    const addressLines = doc.splitTextToSize(quotation.shippingAddress, 80);
    doc.text(addressLines, margin, y);
    y += addressLines.length * 5;
  }

  // Right side - Quotation Info
  const rightX = pageWidth - margin - 60;
  let rightY = y - 30;
  doc.setFont('helvetica', 'bold');
  doc.text('Teklif No:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.quotationNumber, rightX + 35, rightY);
  rightY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Teklif Tarihi:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(quotation.quotationDate), rightX + 35, rightY);
  rightY += 6;

  if (quotation.expirationDate) {
    doc.setFont('helvetica', 'bold');
    doc.text('Gecerlilik:', rightX, rightY);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(quotation.expirationDate), rightX + 35, rightY);
    rightY += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Durum:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  const statusText = getQuotationStatusText(quotation.status);
  doc.text(statusText, rightX + 35, rightY);

  if (quotation.salesPersonName) {
    rightY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Satis Temsilcisi:', rightX, rightY);
    doc.setFont('helvetica', 'normal');
    doc.text(quotation.salesPersonName, rightX + 35, rightY);
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
  doc.text('Isk%', colX, y);
  colX += colWidths[4];
  doc.text('KDV', colX, y);
  colX += colWidths[5];
  doc.text('Toplam', colX, y);

  y += 8;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  quotation.items.forEach((item: QuotationItem) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    colX = margin;
    const productText = doc.splitTextToSize(
      `${item.productCode ? item.productCode + ' - ' : ''}${item.productName}`,
      colWidths[0] - 4
    );
    doc.text(productText, colX + 2, y);
    const rowHeight = productText.length > 1 ? productText.length * 4 : 5;

    colX += colWidths[0];
    doc.text(item.unit || '', colX, y);
    colX += colWidths[1];
    doc.text(item.quantity.toString(), colX, y);
    colX += colWidths[2];
    doc.text(formatCurrency(item.unitPrice, quotation.currency), colX, y);
    colX += colWidths[3];
    doc.text(`%${item.discountRate || 0}`, colX, y);
    colX += colWidths[4];
    doc.text(formatCurrency(item.vatAmount || 0, quotation.currency), colX, y);
    colX += colWidths[5];
    doc.text(formatCurrency(item.lineTotal, quotation.currency), colX, y);

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
  doc.text(formatCurrency(quotation.subTotal, quotation.currency), pageWidth - margin, y, { align: 'right' });
  y += 6;

  if (quotation.discountAmount > 0) {
    doc.text('Indirim:', totalsX, y);
    doc.text(`-${formatCurrency(quotation.discountAmount, quotation.currency)}`, pageWidth - margin, y, { align: 'right' });
    y += 6;
  }

  doc.text('KDV Toplami:', totalsX, y);
  doc.text(formatCurrency(quotation.vatAmount, quotation.currency), pageWidth - margin, y, { align: 'right' });
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Genel Toplam:', totalsX, y);
  doc.text(formatCurrency(quotation.totalAmount, quotation.currency), pageWidth - margin, y, { align: 'right' });

  // Terms & Conditions
  if (quotation.paymentTerms || quotation.deliveryTerms) {
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Sartlar:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    if (quotation.paymentTerms) {
      doc.text(`Odeme: ${quotation.paymentTerms}`, margin, y);
      y += 5;
    }
    if (quotation.deliveryTerms) {
      doc.text(`Teslimat: ${quotation.deliveryTerms}`, margin, y);
      y += 5;
    }
  }

  // Notes
  if (quotation.notes) {
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Notlar:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(quotation.notes, pageWidth - margin * 2);
    doc.text(notesLines, margin, y);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Olusturulma: ${new Date().toLocaleString('tr-TR')}`, margin, footerY);
  doc.text('Stocker - Stok ve Satis Yonetim Sistemi', pageWidth - margin, footerY, { align: 'right' });

  // Save
  doc.save(`Teklif_${quotation.quotationNumber}.pdf`);
}

export { type PDFConfig };
