'use client';

import React from 'react';
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
  Empty,
  Dropdown,
  Space,
  Steps,
  Modal,
  Timeline,
} from 'antd';
import type { TimelineItemProps } from 'antd';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  PrinterIcon,
  WalletIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useSupplierPayment,
  useApproveSupplierPayment,
  useRejectSupplierPayment,
  useCancelSupplierPayment,
  useProcessSupplierPayment,
  useReconcileSupplierPayment,
  useSubmitPaymentForApproval,
} from '@/lib/api/hooks/usePurchase';
import type { SupplierPaymentStatus, PaymentMethod } from '@/lib/api/services/purchase.types';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const statusColors: Record<SupplierPaymentStatus, string> = {
  Draft: 'default',
  PendingApproval: 'blue',
  Approved: 'cyan',
  Rejected: 'red',
  Processed: 'geekblue',
  Completed: 'green',
  Cancelled: 'default',
  Failed: 'error',
};

const statusLabels: Record<SupplierPaymentStatus, string> = {
  Draft: 'Taslak',
  PendingApproval: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Processed: 'İşlendi',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
  Failed: 'Başarısız',
};

const methodLabels: Record<PaymentMethod, string> = {
  Cash: 'Nakit',
  BankTransfer: 'Havale/EFT',
  CreditCard: 'Kredi Kartı',
  Check: 'Çek',
  DirectDebit: 'Otomatik Ödeme',
  Other: 'Diğer',
};

const methodIcons: Record<PaymentMethod, React.ReactNode> = {
  Cash: <CurrencyDollarIcon className="w-4 h-4" />,
  BankTransfer: <BuildingLibraryIcon className="w-4 h-4" />,
  CreditCard: <CreditCardOutlined />,
  Check: <WalletIcon className="w-4 h-4" />,
  DirectDebit: <ArrowPathIcon className="w-4 h-4" />,
  Other: <WalletIcon className="w-4 h-4" />,
};

const typeLabels: Record<string, string> = {
  Standard: 'Standart',
  Advance: 'Avans',
  Partial: 'Kısmi',
  Final: 'Son',
  Refund: 'İade',
};

const getStatusStep = (status: SupplierPaymentStatus): number => {
  const steps: Record<SupplierPaymentStatus, number> = {
    Draft: 0,
    PendingApproval: 1,
    Approved: 2,
    Processed: 3,
    Completed: 4,
    Rejected: -1,
    Cancelled: -1,
    Failed: -1,
  };
  return steps[status] ?? 0;
};

export default function SupplierPaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;

  const { data: payment, isLoading } = useSupplierPayment(paymentId);
  const approvePayment = useApproveSupplierPayment();
  const rejectPayment = useRejectSupplierPayment();
  const cancelPayment = useCancelSupplierPayment();
  const processPayment = useProcessSupplierPayment();
  const reconcilePayment = useReconcileSupplierPayment();
  const submitForApproval = useSubmitPaymentForApproval();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-8">
        <Empty description="Ödeme belgesi bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/payments')}>
            Ödemelere Dön
          </Button>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    approvePayment.mutate({ id: paymentId });
  };

  const handleReject = () => {
    Modal.confirm({
      title: 'Ödemeyi Reddet',
      content: 'Bu ödemeyi reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => rejectPayment.mutate({ id: paymentId, reason: 'Manuel ret' }),
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Ödemeyi İptal Et',
      content: 'Bu ödemeyi iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => cancelPayment.mutate({ id: paymentId, reason: 'Manuel iptal' }),
    });
  };

  const handleProcess = () => {
    processPayment.mutate(paymentId);
  };

  const handleReconcile = () => {
    reconcilePayment.mutate({ id: paymentId, bankTransactionId: `BANK-${payment.paymentNumber}` });
  };

  const handleSubmitForApproval = () => {
    submitForApproval.mutate(paymentId);
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const actionMenuItems = [
    payment.status === 'Draft' && {
      key: 'submit',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Onaya Gönder',
      onClick: handleSubmitForApproval,
    },
    payment.status === 'PendingApproval' && {
      key: 'approve',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Onayla',
      onClick: handleApprove,
    },
    payment.status === 'PendingApproval' && {
      key: 'reject',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'Reddet',
      danger: true,
      onClick: handleReject,
    },
    payment.status === 'Approved' && {
      key: 'process',
      icon: <PlayCircleOutlined />,
      label: 'İşle',
      onClick: handleProcess,
    },
    payment.status === 'Completed' && !payment.isReconciled && {
      key: 'reconcile',
      icon: <ArrowPathIcon className="w-4 h-4" />,
      label: 'Mutabakat Yap',
      onClick: handleReconcile,
    },
    {
      key: 'print',
      icon: <PrinterIcon className="w-4 h-4" />,
      label: 'Yazdır',
    },
    { type: 'divider' },
    !['Cancelled', 'Completed', 'Failed'].includes(payment.status) && {
      key: 'cancel',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'İptal Et',
      danger: true,
      onClick: handleCancel,
    },
  ].filter(Boolean) as MenuProps['items'];

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
              onClick={() => router.push('/purchase/payments')}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <WalletIcon className="w-4 h-4" style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0 flex items-center gap-2">
                  {payment.paymentNumber}
                  <Tag color={statusColors[payment.status as SupplierPaymentStatus]}>
                    {statusLabels[payment.status as SupplierPaymentStatus]}
                  </Tag>
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {payment.supplierName} • {dayjs(payment.paymentDate).format('DD.MM.YYYY')}
                </p>
              </div>
            </div>
          </div>

          <Space>
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
              <Button icon={<EllipsisHorizontalIcon className="w-4 h-4" />}>İşlemler</Button>
            </Dropdown>
            {payment.status === 'Draft' && (
              <Button
                type="primary"
                icon={<PencilIcon className="w-4 h-4" />}
                onClick={() => router.push(`/purchase/payments/${paymentId}/edit`)}
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
            current={getStatusStep(payment.status as SupplierPaymentStatus)}
            status={['Rejected', 'Cancelled', 'Failed'].includes(payment.status) ? 'error' : 'process'}
            items={[
              { title: 'Taslak', icon: <DocumentTextIcon className="w-4 h-4" /> },
              { title: 'Onay Bekliyor' },
              { title: 'Onaylandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
              { title: 'İşlendi', icon: <PlayCircleOutlined /> },
              { title: 'Tamamlandı', icon: <CurrencyDollarIcon className="w-4 h-4" /> },
            ]}
          />
        </Card>

        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Ödeme Tutarı"
                value={payment.amount}
                precision={2}
                prefix={methodIcons[payment.method as PaymentMethod]}
                suffix={payment.currency || 'TRY'}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Ödeme Yöntemi"
                value={methodLabels[payment.method as PaymentMethod] || payment.method}
                valueStyle={{ fontSize: '16px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Ödeme Tipi"
                value={typeLabels[payment.type] || payment.type}
                valueStyle={{ fontSize: '16px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Mutabakat"
                value={payment.isReconciled ? 'Yapıldı' : 'Bekliyor'}
                valueStyle={{
                  color: payment.isReconciled ? '#52c41a' : '#faad14',
                  fontSize: '16px'
                }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Payment Details */}
            <Card title="Ödeme Detayları" className="mb-6">
              <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                <Descriptions.Item label="Ödeme No">{payment.paymentNumber}</Descriptions.Item>
                <Descriptions.Item label="Ödeme Tarihi">
                  {dayjs(payment.paymentDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Tutar">
                  <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                    {formatCurrency(payment.amount, payment.currency)}
                  </Text>
                </Descriptions.Item>
                {payment.currency !== 'TRY' && payment.exchangeRate && (
                  <>
                    <Descriptions.Item label="Döviz Kuru">{payment.exchangeRate}</Descriptions.Item>
                    <Descriptions.Item label="TL Karşılığı">
                      {formatCurrency(payment.amountInBaseCurrency, 'TRY')}
                    </Descriptions.Item>
                  </>
                )}
                <Descriptions.Item label="Ödeme Yöntemi">
                  <Space>
                    {methodIcons[payment.method as PaymentMethod]}
                    {methodLabels[payment.method as PaymentMethod] || payment.method}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Ödeme Tipi">
                  {typeLabels[payment.type] || payment.type}
                </Descriptions.Item>
                {payment.transactionReference && (
                  <Descriptions.Item label="İşlem Referansı" span={2}>
                    {payment.transactionReference}
                  </Descriptions.Item>
                )}
                {payment.description && (
                  <Descriptions.Item label="Açıklama" span={2}>
                    {payment.description}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Bank Details */}
            {(payment.bankName || payment.iban || payment.checkNumber) && (
              <Card title="Banka / Ödeme Bilgileri" className="mb-6">
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                  {payment.bankName && (
                    <Descriptions.Item label="Banka">{payment.bankName}</Descriptions.Item>
                  )}
                  {payment.bankAccountNumber && (
                    <Descriptions.Item label="Hesap No">{payment.bankAccountNumber}</Descriptions.Item>
                  )}
                  {payment.iban && (
                    <Descriptions.Item label="IBAN" span={2}>{payment.iban}</Descriptions.Item>
                  )}
                  {payment.swiftCode && (
                    <Descriptions.Item label="SWIFT">{payment.swiftCode}</Descriptions.Item>
                  )}
                  {payment.checkNumber && (
                    <Descriptions.Item label="Çek No">{payment.checkNumber}</Descriptions.Item>
                  )}
                  {payment.checkDate && (
                    <Descriptions.Item label="Çek Tarihi">
                      {dayjs(payment.checkDate).format('DD.MM.YYYY')}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {/* Notes */}
            {(payment.notes || payment.internalNotes) && (
              <Card title="Notlar" size="small">
                {payment.notes && (
                  <div className="mb-4">
                    <Text strong>Genel Not:</Text>
                    <Paragraph className="mt-1 mb-0 whitespace-pre-wrap">{payment.notes}</Paragraph>
                  </div>
                )}
                {payment.internalNotes && (
                  <div>
                    <Text strong>Dahili Not:</Text>
                    <Paragraph className="mt-1 mb-0 whitespace-pre-wrap">{payment.internalNotes}</Paragraph>
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
                  <a onClick={() => router.push(`/purchase/suppliers/${payment.supplierId}`)}>
                    {payment.supplierName}
                  </a>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Related Invoice */}
            {payment.purchaseInvoiceNumber && (
              <Card title="İlişkili Fatura" size="small" className="mb-4">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Fatura No">
                    <a onClick={() => router.push(`/purchase/invoices/${payment.purchaseInvoiceId}`)}>
                      {payment.purchaseInvoiceNumber}
                    </a>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Process History */}
            <Card title="İşlem Geçmişi" size="small" className="mb-4">
              <Timeline
                items={[
                  {
                    color: 'gray',
                    children: (
                      <div>
                        <Text strong>Oluşturuldu</Text>
                        <div className="text-xs text-gray-500">
                          {dayjs(payment.createdAt).format('DD.MM.YYYY HH:mm')}
                        </div>
                      </div>
                    ),
                  },
                  payment.approvalDate && {
                    color: 'blue',
                    children: (
                      <div>
                        <Text strong>Onaylandı</Text>
                        {payment.approvedByName && (
                          <div className="text-xs">{payment.approvedByName}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          {dayjs(payment.approvalDate).format('DD.MM.YYYY HH:mm')}
                        </div>
                      </div>
                    ),
                  },
                  payment.processedDate && {
                    color: 'geekblue',
                    children: (
                      <div>
                        <Text strong>İşlendi</Text>
                        {payment.processedByName && (
                          <div className="text-xs">{payment.processedByName}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          {dayjs(payment.processedDate).format('DD.MM.YYYY HH:mm')}
                        </div>
                      </div>
                    ),
                  },
                  payment.reconciliationDate && {
                    color: 'green',
                    children: (
                      <div>
                        <Text strong>Mutabakat Yapıldı</Text>
                        {payment.reconciliationReference && (
                          <div className="text-xs">{payment.reconciliationReference}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          {dayjs(payment.reconciliationDate).format('DD.MM.YYYY HH:mm')}
                        </div>
                      </div>
                    ),
                  },
                ].filter(Boolean) as TimelineItemProps[]}
              />
            </Card>

            {/* Reconciliation Info */}
            {payment.isReconciled && (
              <Card title="Mutabakat Bilgileri" size="small" className="mb-4">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Durum">
                    <Tag color="green">Mutabakat Yapıldı</Tag>
                  </Descriptions.Item>
                  {payment.reconciliationDate && (
                    <Descriptions.Item label="Tarih">
                      {dayjs(payment.reconciliationDate).format('DD.MM.YYYY HH:mm')}
                    </Descriptions.Item>
                  )}
                  {payment.reconciliationReference && (
                    <Descriptions.Item label="Referans">
                      {payment.reconciliationReference}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
