'use client';

import React, { useRef, ReactNode } from 'react';
import { Button, Modal } from 'antd';
import { PrinterOutlined, DownloadOutlined, CloseOutlined } from '@ant-design/icons';

interface PrintTemplateProps {
  children: ReactNode;
  title: string;
  visible: boolean;
  onClose: () => void;
}

export function PrintTemplate({ children, title, visible, onClose }: PrintTemplateProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f8f9fa;
              font-weight: 600;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #333;
            }
            .company-info {
              font-size: 12px;
              color: #666;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #1890ff;
              margin-bottom: 5px;
            }
            .document-title {
              font-size: 20px;
              font-weight: bold;
              text-align: right;
            }
            .document-number {
              font-size: 14px;
              color: #666;
              text-align: right;
            }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .info-box {
              width: 48%;
            }
            .info-box h4 {
              margin: 0 0 10px 0;
              padding-bottom: 5px;
              border-bottom: 1px solid #ddd;
              font-size: 14px;
              color: #666;
            }
            .info-row {
              display: flex;
              margin-bottom: 5px;
              font-size: 13px;
            }
            .info-label {
              width: 120px;
              color: #666;
            }
            .info-value {
              font-weight: 500;
            }
            .items-table {
              margin: 20px 0;
            }
            .items-table th {
              background-color: #1890ff;
              color: white;
            }
            .total-section {
              display: flex;
              justify-content: flex-end;
              margin-top: 20px;
            }
            .total-box {
              width: 300px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .total-row.grand-total {
              border-top: 2px solid #333;
              border-bottom: 2px solid #333;
              font-size: 16px;
              font-weight: bold;
              margin-top: 10px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 11px;
              color: #999;
              text-align: center;
            }
            .signature-section {
              display: flex;
              justify-content: space-between;
              margin-top: 60px;
            }
            .signature-box {
              width: 200px;
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #333;
              margin-top: 50px;
              padding-top: 5px;
              font-size: 12px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
            }
            .status-draft { background: #f0f0f0; color: #666; }
            .status-pending { background: #fff7e6; color: #fa8c16; }
            .status-approved { background: #f6ffed; color: #52c41a; }
            .status-rejected { background: #fff2f0; color: #ff4d4f; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose} icon={<CloseOutlined />}>
          Kapat
        </Button>,
        <Button key="print" type="primary" onClick={handlePrint} icon={<PrinterOutlined />}>
          Yazdır
        </Button>,
      ]}
    >
      <div ref={printRef} className="p-4 bg-white">
        {children}
      </div>
    </Modal>
  );
}

// Purchase Order Print Template
interface PurchaseOrderPrintProps {
  visible: boolean;
  onClose: () => void;
  order: {
    orderNumber: string;
    orderDate: string;
    status: string;
    supplierName?: string | null;
    supplierCode?: string | null;
    supplierAddress?: string | null;
    supplierPhone?: string | null;
    supplierEmail?: string | null;
    expectedDeliveryDate?: string | null;
    paymentTerms?: string | null;
    shippingMethod?: string | null;
    shippingAddress?: string | null;
    notes?: string | null;
    items: Array<{
      productName: string;
      productCode?: string | null;
      quantity: number;
      unit: string;
      unitPrice: number;
      discountPercent?: number | null;
      taxRate?: number | null;
      lineTotal: number;
    }>;
    subTotal: number;
    discountAmount?: number | null;
    vatAmount: number;
    totalAmount: number;
    currency?: string | null;
  };
}

export function PurchaseOrderPrint({ visible, onClose, order }: PurchaseOrderPrintProps) {
  const statusClass = {
    Draft: 'status-draft',
    PendingApproval: 'status-pending',
    Confirmed: 'status-approved',
    Rejected: 'status-rejected',
    Sent: 'status-approved',
  }[order.status] || 'status-draft';

  const statusLabel = {
    Draft: 'Taslak',
    PendingApproval: 'Onay Bekliyor',
    Confirmed: 'Onaylandı',
    Rejected: 'Reddedildi',
    Sent: 'Gönderildi',
    PartiallyReceived: 'Kısmen Alındı',
    Received: 'Teslim Alındı',
    Completed: 'Tamamlandı',
    Cancelled: 'İptal',
  }[order.status] || order.status;

  const currency = order.currency === 'TRY' ? '₺' : order.currency || '₺';

  return (
    <PrintTemplate title="Satın Alma Siparişi" visible={visible} onClose={onClose}>
      {/* Header */}
      <div className="header">
        <div>
          <div className="company-name">STOCKER</div>
          <div className="company-info">
            Stok ve Tedarik Zinciri Yönetim Sistemi
          </div>
        </div>
        <div>
          <div className="document-title">SATIN ALMA SİPARİŞİ</div>
          <div className="document-number">{order.orderNumber}</div>
          <div style={{ marginTop: 10 }}>
            <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <div className="info-box">
          <h4>Tedarikçi Bilgileri</h4>
          <div className="info-row">
            <span className="info-label">Firma Adı:</span>
            <span className="info-value">{order.supplierName || '-'}</span>
          </div>
          {order.supplierCode && (
            <div className="info-row">
              <span className="info-label">Tedarikçi Kodu:</span>
              <span className="info-value">{order.supplierCode}</span>
            </div>
          )}
          {order.supplierAddress && (
            <div className="info-row">
              <span className="info-label">Adres:</span>
              <span className="info-value">{order.supplierAddress}</span>
            </div>
          )}
          {order.supplierPhone && (
            <div className="info-row">
              <span className="info-label">Telefon:</span>
              <span className="info-value">{order.supplierPhone}</span>
            </div>
          )}
          {order.supplierEmail && (
            <div className="info-row">
              <span className="info-label">E-posta:</span>
              <span className="info-value">{order.supplierEmail}</span>
            </div>
          )}
        </div>
        <div className="info-box">
          <h4>Sipariş Detayları</h4>
          <div className="info-row">
            <span className="info-label">Sipariş Tarihi:</span>
            <span className="info-value">{new Date(order.orderDate).toLocaleDateString('tr-TR')}</span>
          </div>
          {order.expectedDeliveryDate && (
            <div className="info-row">
              <span className="info-label">Beklenen Teslim:</span>
              <span className="info-value">{new Date(order.expectedDeliveryDate).toLocaleDateString('tr-TR')}</span>
            </div>
          )}
          {order.paymentTerms && (
            <div className="info-row">
              <span className="info-label">Ödeme Vadesi:</span>
              <span className="info-value">{order.paymentTerms}</span>
            </div>
          )}
          {order.shippingMethod && (
            <div className="info-row">
              <span className="info-label">Teslimat Yöntemi:</span>
              <span className="info-value">{order.shippingMethod}</span>
            </div>
          )}
          {order.shippingAddress && (
            <div className="info-row">
              <span className="info-label">Teslimat Adresi:</span>
              <span className="info-value">{order.shippingAddress}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="items-table">
        <table>
          <thead>
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '30%' }}>Ürün</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Miktar</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Birim</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Birim Fiyat</th>
              <th style={{ width: '10%', textAlign: 'center' }}>KDV</th>
              <th style={{ width: '20%', textAlign: 'right' }}>Toplam</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{item.productName}</div>
                  {item.productCode && <div style={{ fontSize: 11, color: '#666' }}>{item.productCode}</div>}
                </td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'center' }}>{item.unit}</td>
                <td style={{ textAlign: 'right' }}>{item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</td>
                <td style={{ textAlign: 'center' }}>%{item.taxRate || 18}</td>
                <td style={{ textAlign: 'right', fontWeight: 500 }}>{item.lineTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="total-section">
        <div className="total-box">
          <div className="total-row">
            <span>Ara Toplam:</span>
            <span>{order.subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</span>
          </div>
          {(order.discountAmount || 0) > 0 && (
            <div className="total-row">
              <span>İskonto:</span>
              <span style={{ color: '#cf1322' }}>-{(order.discountAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</span>
            </div>
          )}
          <div className="total-row">
            <span>KDV:</span>
            <span>{order.vatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</span>
          </div>
          <div className="total-row grand-total">
            <span>Genel Toplam:</span>
            <span>{order.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div style={{ marginTop: 30, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
          <div style={{ fontWeight: 600, marginBottom: 5 }}>Notlar:</div>
          <div style={{ fontSize: 13, color: '#666' }}>{order.notes}</div>
        </div>
      )}

      {/* Signatures */}
      <div className="signature-section">
        <div className="signature-box">
          <div className="signature-line">Hazırlayan</div>
        </div>
        <div className="signature-box">
          <div className="signature-line">Onaylayan</div>
        </div>
        <div className="signature-box">
          <div className="signature-line">Tedarikçi Kaşe/İmza</div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div>Bu belge {new Date().toLocaleDateString('tr-TR')} tarihinde Stocker ERP Sistemi tarafından oluşturulmuştur.</div>
        <div>Sayfa 1 / 1</div>
      </div>
    </PrintTemplate>
  );
}

// Purchase Invoice Print Template
interface PurchaseInvoicePrintProps {
  visible: boolean;
  onClose: () => void;
  invoice: {
    invoiceNumber: string;
    supplierInvoiceNumber?: string | null;
    invoiceDate: string;
    dueDate?: string | null;
    status: string;
    type?: string | null;
    supplierName?: string | null;
    supplierAddress?: string | null;
    supplierTaxNumber?: string | null;
    supplierTaxOffice?: string | null;
    purchaseOrderNumber?: string | null;
    notes?: string | null;
    items: Array<{
      productCode?: string | null;
      productName: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      discountRate?: number | null;
      discountAmount?: number | null;
      vatRate: number;
      vatAmount: number;
      totalAmount: number;
    }>;
    subTotal: number;
    discountAmount?: number | null;
    vatAmount: number;
    withholdingTaxAmount?: number | null;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    currency?: string | null;
  };
}

export function PurchaseInvoicePrint({ visible, onClose, invoice }: PurchaseInvoicePrintProps) {
  const statusLabel = {
    Draft: 'Taslak',
    PendingApproval: 'Onay Bekliyor',
    Approved: 'Onaylandı',
    Rejected: 'Reddedildi',
    PartiallyPaid: 'Kısmen Ödendi',
    Paid: 'Ödendi',
    Cancelled: 'İptal',
  }[invoice.status] || invoice.status;

  const typeLabel = {
    Standard: 'Standart',
    Credit: 'Alacak Dekontu',
    Proforma: 'Proforma',
    Prepayment: 'Ön Ödeme',
  }[invoice.type || 'Standard'] || invoice.type;

  const currency = invoice.currency === 'TRY' ? '₺' : invoice.currency || '₺';

  return (
    <PrintTemplate title="Satın Alma Faturası" visible={visible} onClose={onClose}>
      {/* Header */}
      <div className="header">
        <div>
          <div className="company-name">STOCKER</div>
          <div className="company-info">
            Stok ve Tedarik Zinciri Yönetim Sistemi
          </div>
        </div>
        <div>
          <div className="document-title">SATIN ALMA FATURASI</div>
          <div className="document-number">{invoice.invoiceNumber}</div>
          {invoice.supplierInvoiceNumber && (
            <div style={{ fontSize: 12, color: '#666' }}>Tedarikçi Fatura No: {invoice.supplierInvoiceNumber}</div>
          )}
          <div style={{ marginTop: 10 }}>
            <span className="status-badge status-approved">{statusLabel}</span>
            {typeLabel && <span className="status-badge status-draft" style={{ marginLeft: 8 }}>{typeLabel}</span>}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <div className="info-box">
          <h4>Tedarikçi Bilgileri</h4>
          <div className="info-row">
            <span className="info-label">Firma Adı:</span>
            <span className="info-value">{invoice.supplierName || '-'}</span>
          </div>
          {invoice.supplierTaxNumber && (
            <div className="info-row">
              <span className="info-label">Vergi No:</span>
              <span className="info-value">{invoice.supplierTaxNumber}</span>
            </div>
          )}
          {invoice.supplierTaxOffice && (
            <div className="info-row">
              <span className="info-label">Vergi Dairesi:</span>
              <span className="info-value">{invoice.supplierTaxOffice}</span>
            </div>
          )}
          {invoice.supplierAddress && (
            <div className="info-row">
              <span className="info-label">Adres:</span>
              <span className="info-value">{invoice.supplierAddress}</span>
            </div>
          )}
        </div>
        <div className="info-box">
          <h4>Fatura Detayları</h4>
          <div className="info-row">
            <span className="info-label">Fatura Tarihi:</span>
            <span className="info-value">{new Date(invoice.invoiceDate).toLocaleDateString('tr-TR')}</span>
          </div>
          {invoice.dueDate && (
            <div className="info-row">
              <span className="info-label">Vade Tarihi:</span>
              <span className="info-value">{new Date(invoice.dueDate).toLocaleDateString('tr-TR')}</span>
            </div>
          )}
          {invoice.purchaseOrderNumber && (
            <div className="info-row">
              <span className="info-label">Sipariş No:</span>
              <span className="info-value">{invoice.purchaseOrderNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="items-table">
        <table>
          <thead>
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '25%' }}>Ürün</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Miktar</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Birim Fiyat</th>
              <th style={{ width: '10%', textAlign: 'center' }}>KDV %</th>
              <th style={{ width: '15%', textAlign: 'right' }}>KDV Tutarı</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Toplam</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{item.productName}</div>
                  {item.productCode && <div style={{ fontSize: 11, color: '#666' }}>{item.productCode}</div>}
                </td>
                <td style={{ textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                <td style={{ textAlign: 'right' }}>{item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</td>
                <td style={{ textAlign: 'center' }}>%{item.vatRate}</td>
                <td style={{ textAlign: 'right' }}>{item.vatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</td>
                <td style={{ textAlign: 'right', fontWeight: 500 }}>{item.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="total-section">
        <div className="total-box">
          <div className="total-row">
            <span>Ara Toplam:</span>
            <span>{invoice.subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</span>
          </div>
          {(invoice.discountAmount || 0) > 0 && (
            <div className="total-row">
              <span>İskonto:</span>
              <span style={{ color: '#cf1322' }}>-{(invoice.discountAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</span>
            </div>
          )}
          <div className="total-row">
            <span>KDV Toplam:</span>
            <span>{invoice.vatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</span>
          </div>
          {(invoice.withholdingTaxAmount || 0) > 0 && (
            <div className="total-row">
              <span>Stopaj:</span>
              <span style={{ color: '#cf1322' }}>-{(invoice.withholdingTaxAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</span>
            </div>
          )}
          <div className="total-row grand-total">
            <span>Genel Toplam:</span>
            <span>{invoice.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</span>
          </div>
          <div className="total-row" style={{ marginTop: 15, color: '#52c41a' }}>
            <span>Ödenen:</span>
            <span>{invoice.paidAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</span>
          </div>
          <div className="total-row" style={{ color: invoice.remainingAmount > 0 ? '#fa8c16' : '#52c41a', fontWeight: 600 }}>
            <span>Kalan:</span>
            <span>{invoice.remainingAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div style={{ marginTop: 30, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
          <div style={{ fontWeight: 600, marginBottom: 5 }}>Notlar:</div>
          <div style={{ fontSize: 13, color: '#666' }}>{invoice.notes}</div>
        </div>
      )}

      {/* Footer */}
      <div className="footer">
        <div>Bu belge {new Date().toLocaleDateString('tr-TR')} tarihinde Stocker ERP Sistemi tarafından oluşturulmuştur.</div>
      </div>
    </PrintTemplate>
  );
}

export default PrintTemplate;
