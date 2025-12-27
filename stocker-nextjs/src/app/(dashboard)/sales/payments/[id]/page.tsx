'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography,
  Card,
  Button,
  Space,
  Tag,
  Descriptions,
  Spin,
  message,
  Modal,
  Row,
  Col,
  Statistic,
  Input,
  InputNumber,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  PencilIcon,
  PrinterIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  usePayment,
  useConfirmPayment,
  useCompletePayment,
  useRejectPayment,
  useRefundPayment,
} from '@/lib/api/hooks/usePayments';
import type { PaymentStatus, PaymentMethod } from '@/lib/api/services/payment.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusConfig: Record<PaymentStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Pending: { color: 'orange', label: 'Bekliyor', icon: <CurrencyDollarIcon className="w-4 h-4" /> },
  Confirmed: { color: 'blue', label: 'Onaylandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Completed: { color: 'green', label: 'Tamamlandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Rejected: { color: 'red', label: 'Reddedildi', icon: <XCircleIcon className="w-4 h-4" /> },
  Refunded: { color: 'purple', label: 'İade Edildi', icon: <RollbackOutlined /> },
};

const methodLabels: Record<PaymentMethod, string> = {
  Cash: 'Nakit',
  BankTransfer: 'Havale/EFT',
  CreditCard: 'Kredi Kartı',
  DebitCard: 'Banka Kartı',
  Check: 'Çek',
  DirectDebit: 'Otomatik Ödeme',
  Other: 'Diğer',
};

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('');

  const { data: payment, isLoading } = usePayment(id);
  const confirmPayment = useConfirmPayment();
  const completePayment = useCompletePayment();
  const rejectPayment = useRejectPayment();
  const refundPayment = useRefundPayment();

  const handleConfirm = async () => {
    try {
      await confirmPayment.mutateAsync(id);
      message.success('Ödeme onaylandı');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Onaylama başarısız');
    }
  };

  const handleComplete = async () => {
    try {
      await completePayment.mutateAsync(id);
      message.success('Ödeme tamamlandı');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Tamamlama başarısız');
    }
  };

  const handleRejectClick = () => {
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      message.error('Lütfen red sebebi girin');
      return;
    }

    try {
      await rejectPayment.mutateAsync({ id, reason: rejectReason });
      message.success('Ödeme reddedildi');
      setRejectModalOpen(false);
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Red işlemi başarısız');
    }
  };

  const handleRefundClick = () => {
    if (payment) {
      setRefundAmount(payment.amount - payment.refundedAmount);
    }
    setRefundReason('');
    setRefundModalOpen(true);
  };

  const handleRefundConfirm = async () => {
    if (!refundAmount || refundAmount <= 0) {
      message.error('Lütfen geçerli bir tutar girin');
      return;
    }
    if (!refundReason.trim()) {
      message.error('Lütfen iade sebebi girin');
      return;
    }

    try {
      await refundPayment.mutateAsync({ id, amount: refundAmount, reason: refundReason });
      message.success('İade işlemi başarılı');
      setRefundModalOpen(false);
    } catch (error: any) {
      message.error(error.response?.data?.error || 'İade işlemi başarısız');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <Text type="secondary">Ödeme bulunamadı</Text>
          </div>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[payment.status];
  const remainingAmount = payment.amount - payment.refundedAmount;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()}>
            Geri
          </Button>
          <CurrencyDollarIcon className="w-10 h-10 text-green-500" />
          <div>
            <Title level={2} className="!mb-0">
              {payment.paymentNumber}
            </Title>
            <Text type="secondary">{methodLabels[payment.method]}</Text>
          </div>
          <Tag color={statusInfo.color} icon={statusInfo.icon} className="ml-4">
            {statusInfo.label}
          </Tag>
        </div>
        <Space>
          <Button icon={<PrinterIcon className="w-4 h-4" />}>Yazdır</Button>
          {payment.status === 'Pending' && (
            <>
              <Link href={`/sales/payments/${id}/edit`}>
                <Button icon={<PencilIcon className="w-4 h-4" />}>Düzenle</Button>
              </Link>
              <Button
                type="primary"
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleConfirm}
                loading={confirmPayment.isPending}
              >
                Onayla
              </Button>
              <Button
                danger
                icon={<XCircleIcon className="w-4 h-4" />}
                onClick={handleRejectClick}
              >
                Reddet
              </Button>
            </>
          )}
          {payment.status === 'Confirmed' && (
            <Button
              type="primary"
              icon={<CheckCircleIcon className="w-4 h-4" />}
              onClick={handleComplete}
              loading={completePayment.isPending}
            >
              Tamamla
            </Button>
          )}
          {payment.status === 'Completed' && remainingAmount > 0 && (
            <Button
              icon={<RollbackOutlined />}
              onClick={handleRefundClick}
            >
              İade Et
            </Button>
          )}
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ödeme Tutarı"
              value={payment.amount}
              precision={2}
              suffix={payment.currency}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="İade Edilen"
              value={payment.refundedAmount}
              precision={2}
              suffix={payment.currency}
              valueStyle={{ color: payment.refundedAmount > 0 ? '#ff4d4f' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Net Tutar"
              value={remainingAmount}
              precision={2}
              suffix={payment.currency}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ödeme Tarihi"
              value={dayjs(payment.paymentDate).format('DD/MM/YYYY')}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Info */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Ödeme Bilgileri">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Ödeme No">{payment.paymentNumber}</Descriptions.Item>
              <Descriptions.Item label="Ödeme Tarihi">
                {dayjs(payment.paymentDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Ödeme Yöntemi">
                <Tag>{methodLabels[payment.method]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Para Birimi">{payment.currency}</Descriptions.Item>
              {payment.reference && (
                <Descriptions.Item label="Referans">{payment.reference}</Descriptions.Item>
              )}
              {payment.transactionId && (
                <Descriptions.Item label="İşlem ID">{payment.transactionId}</Descriptions.Item>
              )}
              {payment.invoiceId && (
                <Descriptions.Item label="Fatura">
                  <Link href={`/sales/invoices/${payment.invoiceId}`} className="text-blue-600">
                    {payment.invoiceNumber || 'Faturayı Görüntüle'}
                  </Link>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Müşteri ve Banka Bilgileri">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Müşteri Adı">{payment.customerName}</Descriptions.Item>
              {payment.bankAccountName && (
                <Descriptions.Item label="Banka Hesabı">{payment.bankAccountName}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Status History */}
      <Card title="Durum Bilgileri" className="mb-6">
        <Descriptions column={2} size="small">
          {payment.confirmedBy && (
            <>
              <Descriptions.Item label="Onaylayan">{payment.confirmedBy}</Descriptions.Item>
              <Descriptions.Item label="Onay Tarihi">
                {payment.confirmedAt ? dayjs(payment.confirmedAt).format('DD/MM/YYYY HH:mm') : '-'}
              </Descriptions.Item>
            </>
          )}
          {payment.completedAt && (
            <Descriptions.Item label="Tamamlanma Tarihi">
              {dayjs(payment.completedAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          )}
          {payment.rejectedReason && (
            <>
              <Descriptions.Item label="Red Sebebi">{payment.rejectedReason}</Descriptions.Item>
              <Descriptions.Item label="Red Tarihi">
                {payment.rejectedAt ? dayjs(payment.rejectedAt).format('DD/MM/YYYY HH:mm') : '-'}
              </Descriptions.Item>
            </>
          )}
          {payment.refundedAmount > 0 && (
            <>
              <Descriptions.Item label="İade Sebebi">{payment.refundReason || '-'}</Descriptions.Item>
              <Descriptions.Item label="İade Tarihi">
                {payment.refundedAt ? dayjs(payment.refundedAt).format('DD/MM/YYYY HH:mm') : '-'}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Card>

      {/* Description */}
      {payment.description && (
        <Card title="Açıklama" className="mb-6">
          <Text>{payment.description}</Text>
        </Card>
      )}

      {/* Timestamps */}
      <Card>
        <Descriptions size="small">
          <Descriptions.Item label="Oluşturulma">
            {dayjs(payment.createdAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Son Güncelleme">
            {dayjs(payment.updatedAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Reject Modal */}
      <Modal
        title="Ödemeyi Reddet"
        open={rejectModalOpen}
        onOk={handleRejectConfirm}
        onCancel={() => setRejectModalOpen(false)}
        okText="Reddet"
        cancelText="Vazgeç"
        okButtonProps={{ danger: true, loading: rejectPayment.isPending }}
      >
        <div className="mb-4">
          <Text>Bu ödemeyi reddetmek istediğinizden emin misiniz?</Text>
        </div>
        <Input.TextArea
          placeholder="Red sebebini girin..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
        />
      </Modal>

      {/* Refund Modal */}
      <Modal
        title="Ödeme İadesi"
        open={refundModalOpen}
        onOk={handleRefundConfirm}
        onCancel={() => setRefundModalOpen(false)}
        okText="İade Et"
        cancelText="Vazgeç"
        okButtonProps={{ loading: refundPayment.isPending }}
      >
        <div className="mb-4">
          <Text>Maksimum iade edilebilir tutar: {remainingAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {payment.currency}</Text>
        </div>
        <div className="mb-4">
          <Text strong>İade Tutarı:</Text>
          <InputNumber
            className="w-full mt-2"
            min={0}
            max={remainingAmount}
            precision={2}
            value={refundAmount}
            onChange={(value) => setRefundAmount(value || 0)}
            addonAfter={payment.currency}
          />
        </div>
        <div>
          <Text strong>İade Sebebi:</Text>
          <Input.TextArea
            className="mt-2"
            placeholder="İade sebebini girin..."
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
