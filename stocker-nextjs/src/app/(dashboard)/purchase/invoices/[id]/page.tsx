'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Typography,
  Spin,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Table,
  Empty,
  Dropdown,
  Space,
  Steps,
  Modal,
  Progress,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  PencilIcon,
  PrinterIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  usePurchaseInvoice,
  useApprovePurchaseInvoice,
  useRejectPurchaseInvoice,
  useCancelPurchaseInvoice,
  useMarkInvoiceAsPaid,
  useSubmitInvoiceForApproval,
} from '@/lib/api/hooks/usePurchase';
import { PurchaseInvoicePrint } from '@/components/print';
import type { PurchaseInvoiceStatus, PurchaseInvoiceItemDto } from '@/lib/api/services/purchase.types';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const statusColors: Record<PurchaseInvoiceStatus, string> = {
  Draft: 'default',
  PendingApproval: 'orange',
  Approved: 'purple',
  Rejected: 'red',
  PartiallyPaid: 'geekblue',
  Paid: 'green',
  Cancelled: 'default',
};

const statusLabels: Record<PurchaseInvoiceStatus, string> = {
  Draft: 'Taslak',
  PendingApproval: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  PartiallyPaid: 'Kısmen Ödendi',
  Paid: 'Ödendi',
  Cancelled: 'İptal',
};

const typeLabels: Record<string, string> = {
  Standard: 'Standart',
  Credit: 'Alacak Dekontu',
  Proforma: 'Proforma',
  Prepayment: 'Ön Ödeme',
};

const getStatusStep = (status: PurchaseInvoiceStatus): number => {
  const steps: Record<PurchaseInvoiceStatus, number> = {
    Draft: 0,
    PendingApproval: 1,
    Approved: 2,
    PartiallyPaid: 3,
    Paid: 4,
    Rejected: -1,
    Cancelled: -1,
  };
  return steps[status] ?? 0;
};

export default function PurchaseInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [printModalVisible, setPrintModalVisible] = useState(false);

  const { data: invoice, isLoading } = usePurchaseInvoice(invoiceId);
  const approveInvoice = useApprovePurchaseInvoice();
  const rejectInvoice = useRejectPurchaseInvoice();
  const cancelInvoice = useCancelPurchaseInvoice();
  const markAsPaid = useMarkInvoiceAsPaid();
  const submitForApproval = useSubmitInvoiceForApproval();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8">
        <Empty description="Fatura bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/invoices')}>
            Faturalara Dön
          </Button>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    approveInvoice.mutate({ id: invoiceId });
  };

  const handleReject = () => {
    Modal.confirm({
      title: 'Faturayı Reddet',
      content: 'Bu faturayı reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => rejectInvoice.mutate({ id: invoiceId, reason: 'Manuel ret' }),
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Faturayı İptal Et',
      content: 'Bu faturayı iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => cancelInvoice.mutate({ id: invoiceId, reason: 'Manuel iptal' }),
    });
  };

  const handleMarkAsPaid = () => {
    markAsPaid.mutate({ id: invoiceId });
  };

  const handleSubmitForApproval = () => {
    submitForApproval.mutate(invoiceId);
  };

  const paymentPercentage = invoice.totalAmount > 0
    ? Math.round((invoice.paidAmount / invoice.totalAmount) * 100)
    : 0;

  const isOverdue = invoice.dueDate && dayjs(invoice.dueDate).isBefore(dayjs(), 'day')
    && !['Paid', 'Cancelled'].includes(invoice.status);

  const actionMenuItems = [
    invoice.status === 'Draft' && {
      key: 'submit',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Onaya Gönder',
      onClick: handleSubmitForApproval,
    },
    invoice.status === 'PendingApproval' && {
      key: 'approve',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Onayla',
      onClick: handleApprove,
    },
    invoice.status === 'PendingApproval' && {
      key: 'reject',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'Reddet',
      danger: true,
      onClick: handleReject,
    },
    ['Approved', 'PartiallyPaid'].includes(invoice.status) && {
      key: 'pay',
      icon: <CurrencyDollarIcon className="w-4 h-4" />,
      label: 'Ödeme Kaydet',
      onClick: handleMarkAsPaid,
    },
    {
      key: 'print',
      icon: <PrinterIcon className="w-4 h-4" />,
      label: 'Yazdır',
      onClick: () => setPrintModalVisible(true),
    },
    { type: 'divider' },
    !['Cancelled', 'Paid'].includes(invoice.status) && {
      key: 'cancel',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'İptal Et',
      danger: true,
      onClick: handleCancel,
    },
  ].filter(Boolean) as MenuProps['items'];

  const itemColumns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: PurchaseInvoiceItemDto) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
      render: (qty: number, record: PurchaseInvoiceItemDto) => `${qty} ${record.unit}`,
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      render: (price: number) => `${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`,
    },
    {
      title: 'İskonto',
      key: 'discount',
      align: 'right' as const,
      render: (_: any, record: PurchaseInvoiceItemDto) => (
        <span>
          {record.discountRate > 0 ? `%${record.discountRate}` : '-'}
          {record.discountAmount > 0 && (
            <div className="text-xs text-gray-500">
              -{record.discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </div>
          )}
        </span>
      ),
    },
    {
      title: 'KDV',
      key: 'vat',
      align: 'right' as const,
      render: (_: any, record: PurchaseInvoiceItemDto) => (
        <span>
          %{record.vatRate}
          <div className="text-xs text-gray-500">
            {record.vatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </div>
        </span>
      ),
    },
    {
      title: 'Toplam',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (amount: number) => (
        <Text strong>{amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/purchase/invoices')}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
              >
                <DocumentTextIcon className="w-4 h-4" style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0 flex items-center gap-2">
                  {invoice.invoiceNumber}
                  <Tag color={statusColors[invoice.status as PurchaseInvoiceStatus]}>
                    {statusLabels[invoice.status as PurchaseInvoiceStatus]}
                  </Tag>
                  {isOverdue && (
                    <Tag color="red" icon={<ExclamationCircleIcon className="w-4 h-4" />}>
                      Vadesi Geçmiş
                    </Tag>
                  )}
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {invoice.supplierName} • {dayjs(invoice.invoiceDate).format('DD.MM.YYYY')}
                </p>
              </div>
            </div>
          </div>

          <Space>
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
              <Button icon={<EllipsisHorizontalIcon className="w-4 h-4" />}>İşlemler</Button>
            </Dropdown>
            {invoice.status === 'Draft' && (
              <Button
                type="primary"
                icon={<PencilIcon className="w-4 h-4" />}
                onClick={() => router.push(`/purchase/invoices/${invoiceId}/edit`)}
              >
                Düzenle
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Progress Steps */}
        <Card className="mb-6">
          <Steps
            current={getStatusStep(invoice.status as PurchaseInvoiceStatus)}
            status={['Rejected', 'Cancelled'].includes(invoice.status) ? 'error' : 'process'}
            items={[
              { title: 'Taslak', icon: <DocumentTextIcon className="w-4 h-4" /> },
              { title: 'Onay Bekliyor' },
              { title: 'Onaylandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
              { title: 'Kısmen Ödendi' },
              { title: 'Ödendi', icon: <CurrencyDollarIcon className="w-4 h-4" /> },
            ]}
          />
        </Card>

        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Toplam Tutar"
                value={invoice.totalAmount}
                precision={2}
                suffix={invoice.currency || '₺'}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Ödenen"
                value={invoice.paidAmount}
                precision={2}
                suffix="₺"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Kalan"
                value={invoice.remainingAmount}
                precision={2}
                suffix="₺"
                valueStyle={{ color: invoice.remainingAmount > 0 ? '#fa8c16' : '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <div className="mb-2">
                <Text type="secondary">Ödeme Durumu</Text>
              </div>
              <Progress
                percent={paymentPercentage}
                status={paymentPercentage === 100 ? 'success' : 'active'}
                format={(percent) => `%${percent}`}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Invoice Items */}
            <Card title="Fatura Kalemleri" className="mb-6">
              <Table
                dataSource={invoice.items || []}
                columns={itemColumns}
                rowKey="id"
                pagination={false}
                size="small"
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <Text strong>Ara Toplam</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong>{invoice.subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    {invoice.discountAmount > 0 && (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={6} align="right">
                          <Text>İskonto {invoice.discountRate > 0 && `(%${invoice.discountRate})`}</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <Text type="success">-{invoice.discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    )}
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <Text>KDV Toplam</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text>{invoice.vatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    {invoice.withholdingTaxAmount > 0 && (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={6} align="right">
                          <Text>Stopaj</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <Text type="danger">-{invoice.withholdingTaxAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    )}
                    <Table.Summary.Row style={{ background: '#fafafa' }}>
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <Text strong style={{ fontSize: 16 }}>Genel Toplam</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                          {invoice.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency || '₺'}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Card>

            {/* Notes */}
            {(invoice.notes || invoice.internalNotes) && (
              <Card title="Notlar" size="small">
                {invoice.notes && (
                  <div className="mb-4">
                    <Text strong>Genel Not:</Text>
                    <Paragraph className="mt-1 mb-0 whitespace-pre-wrap">{invoice.notes}</Paragraph>
                  </div>
                )}
                {invoice.internalNotes && (
                  <div>
                    <Text strong>Dahili Not:</Text>
                    <Paragraph className="mt-1 mb-0 whitespace-pre-wrap">{invoice.internalNotes}</Paragraph>
                  </div>
                )}
              </Card>
            )}
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            {/* Supplier Info */}
            <Card title="Tedarikçi Bilgileri" size="small" className="mb-4">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Tedarikçi">
                  <a onClick={() => router.push(`/purchase/suppliers/${invoice.supplierId}`)}>
                    {invoice.supplierName}
                  </a>
                </Descriptions.Item>
                {invoice.supplierTaxNumber && (
                  <Descriptions.Item label="Vergi No">{invoice.supplierTaxNumber}</Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Invoice Info */}
            <Card title="Fatura Bilgileri" size="small" className="mb-4">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Fatura No">{invoice.invoiceNumber}</Descriptions.Item>
                {invoice.supplierInvoiceNumber && (
                  <Descriptions.Item label="Tedarikçi Fatura No">{invoice.supplierInvoiceNumber}</Descriptions.Item>
                )}
                <Descriptions.Item label="Fatura Tarihi">
                  {dayjs(invoice.invoiceDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Vade Tarihi">
                  {invoice.dueDate ? (
                    <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                      {dayjs(invoice.dueDate).format('DD.MM.YYYY')}
                    </span>
                  ) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Tip">
                  {typeLabels[invoice.type] || invoice.type}
                </Descriptions.Item>
                {invoice.currency !== 'TRY' && invoice.exchangeRate && (
                  <>
                    <Descriptions.Item label="Para Birimi">{invoice.currency}</Descriptions.Item>
                    <Descriptions.Item label="Kur">{invoice.exchangeRate}</Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </Card>

            {/* Related Documents */}
            {(invoice.purchaseOrderNumber || invoice.goodsReceiptNumber) && (
              <Card title="İlişkili Belgeler" size="small" className="mb-4">
                <Descriptions column={1} size="small">
                  {invoice.purchaseOrderNumber && (
                    <Descriptions.Item label="Sipariş No">
                      <a onClick={() => router.push(`/purchase/orders/${invoice.purchaseOrderId}`)}>
                        {invoice.purchaseOrderNumber}
                      </a>
                    </Descriptions.Item>
                  )}
                  {invoice.goodsReceiptNumber && (
                    <Descriptions.Item label="Mal Alım No">
                      <a onClick={() => router.push(`/purchase/goods-receipts/${invoice.goodsReceiptId}`)}>
                        {invoice.goodsReceiptNumber}
                      </a>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {/* E-Invoice Info */}
            {invoice.eInvoiceId && (
              <Card title="E-Fatura Bilgileri" size="small" className="mb-4">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="E-Fatura ID">{invoice.eInvoiceId}</Descriptions.Item>
                  {invoice.eInvoiceUUID && (
                    <Descriptions.Item label="E-Fatura UUID">{invoice.eInvoiceUUID}</Descriptions.Item>
                  )}
                  {invoice.eInvoiceStatus && (
                    <Descriptions.Item label="Durum">
                      <Tag>{invoice.eInvoiceStatus}</Tag>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {/* Approval Info */}
            {invoice.approvalDate && (
              <Card title="Onay Bilgileri" size="small" className="mb-4">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Onay Tarihi">
                    {dayjs(invoice.approvalDate).format('DD.MM.YYYY HH:mm')}
                  </Descriptions.Item>
                  {invoice.approvedByName && (
                    <Descriptions.Item label="Onaylayan">{invoice.approvedByName}</Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}
          </Col>
        </Row>
      </div>

      {/* Print Modal */}
      {invoice && (
        <PurchaseInvoicePrint
          visible={printModalVisible}
          onClose={() => setPrintModalVisible(false)}
          invoice={{
            invoiceNumber: invoice.invoiceNumber,
            supplierInvoiceNumber: invoice.supplierInvoiceNumber,
            invoiceDate: invoice.invoiceDate,
            dueDate: invoice.dueDate,
            supplierName: invoice.supplierName,
            supplierTaxNumber: invoice.supplierTaxNumber,
            status: invoice.status,
            type: invoice.type,
            items: (invoice.items || []).map((item) => ({
              productCode: item.productCode,
              productName: item.productName,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              vatRate: item.vatRate,
              vatAmount: item.vatAmount,
              totalAmount: item.totalAmount,
            })),
            subTotal: invoice.subTotal,
            discountAmount: invoice.discountAmount,
            vatAmount: invoice.vatAmount,
            withholdingTaxAmount: invoice.withholdingTaxAmount,
            totalAmount: invoice.totalAmount,
            paidAmount: invoice.paidAmount,
            remainingAmount: invoice.remainingAmount,
            currency: invoice.currency || 'TRY',
            notes: invoice.notes,
            purchaseOrderNumber: invoice.purchaseOrderNumber,
          }}
        />
      )}
    </div>
  );
}
