'use client';

import React from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Typography,
  Button,
  Space,
  Timeline,
  message,
  Modal,
  Input,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Spinner } from '@/components/primitives';
import { useRouter, useParams } from 'next/navigation';
import {
  useSalesCommission,
  useApproveCommission,
  useRejectCommission,
  useMarkCommissionAsPaid,
} from '@/lib/api/hooks/useSales';
import type { SalesCommissionStatus } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusColors: Record<SalesCommissionStatus, string> = {
  Pending: 'processing',
  Approved: 'cyan',
  Rejected: 'error',
  Paid: 'success',
  Cancelled: 'default',
};

const statusLabels: Record<SalesCommissionStatus, string> = {
  Pending: 'Beklemede',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Paid: 'Ödendi',
  Cancelled: 'İptal',
};

export default function CommissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);
  const [payModalOpen, setPayModalOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  const [paymentRef, setPaymentRef] = React.useState('');

  const { data: commission, isLoading } = useSalesCommission(id);
  const approveMutation = useApproveCommission();
  const rejectMutation = useRejectCommission();
  const markPaidMutation = useMarkCommissionAsPaid();

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(id);
      message.success('Komisyon onaylandı');
    } catch {
      message.error('Komisyon onaylanamadı');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.error('Red sebebi girilmelidir');
      return;
    }
    try {
      await rejectMutation.mutateAsync({ id, reason: rejectReason });
      message.success('Komisyon reddedildi');
      setRejectModalOpen(false);
    } catch {
      message.error('Komisyon reddedilemedi');
    }
  };

  const handleMarkPaid = async () => {
    try {
      await markPaidMutation.mutateAsync({ id, paymentReference: paymentRef });
      message.success('Komisyon ödendi olarak işaretlendi');
      setPayModalOpen(false);
    } catch {
      message.error('İşlem gerçekleştirilemedi');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!commission) {
    return (
      <div style={{ padding: 24 }}>
        <Text type="danger">Komisyon bulunamadı</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/sales/commissions')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Komisyon: {commission.referenceNumber}
          </Title>
          <Tag color={statusColors[commission.status as SalesCommissionStatus]}>
            {statusLabels[commission.status as SalesCommissionStatus]}
          </Tag>
        </Space>
        <Space>
          {commission.status === 'Pending' && (
            <>
              <Button type="primary" icon={<CheckIcon className="w-4 h-4" />} onClick={handleApprove}>
                Onayla
              </Button>
              <Button danger icon={<XMarkIcon className="w-4 h-4" />} onClick={() => setRejectModalOpen(true)}>
                Reddet
              </Button>
            </>
          )}
          {commission.status === 'Approved' && (
            <Button type="primary" icon={<CurrencyDollarIcon className="w-4 h-4" />} onClick={() => setPayModalOpen(true)}>
              Ödendi İşaretle
            </Button>
          )}
        </Space>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          {/* Commission Info */}
          <Card title="Komisyon Bilgileri" style={{ marginBottom: 24 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Referans No">{commission.referenceNumber}</Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusColors[commission.status as SalesCommissionStatus]}>
                  {statusLabels[commission.status as SalesCommissionStatus]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Komisyon Tutarı">
                <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(commission.commissionAmount)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Komisyon Oranı">
                %{commission.commissionRate}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Sales Person Info */}
          <Card title="Satış Temsilcisi" style={{ marginBottom: 24 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Ad Soyad">{commission.salesPersonName}</Descriptions.Item>
              <Descriptions.Item label="Plan">{commission.planName || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Order Info */}
          <Card title="Sipariş Bilgileri" style={{ marginBottom: 24 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Sipariş No">
                <a onClick={() => router.push(`/sales/orders/${commission.orderId}`)}>
                  {commission.orderNumber}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Sipariş Tutarı">
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(commission.orderAmount ?? 0)}
              </Descriptions.Item>
              <Descriptions.Item label="Müşteri">{commission.customerName}</Descriptions.Item>
              <Descriptions.Item label="Sipariş Tarihi">
                {commission.orderDate ? dayjs(commission.orderDate).format('DD.MM.YYYY') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Payment Info */}
          {commission.status === 'Paid' && (
            <Card title="Ödeme Bilgileri">
              <Descriptions column={2}>
                <Descriptions.Item label="Ödeme Tarihi">
                  {commission.paidAt ? dayjs(commission.paidAt).format('DD.MM.YYYY HH:mm') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Ödeme Referansı">
                  {commission.paymentReference || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Rejection Info */}
          {commission.status === 'Rejected' && commission.rejectionReason && (
            <Card title="Red Bilgileri">
              <Text type="danger">{commission.rejectionReason}</Text>
            </Card>
          )}
        </div>

        <div>
          {/* Timeline */}
          <Card title="Durum Geçmişi">
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <>
                      <Text strong>Oluşturuldu</Text>
                      <br />
                      <Text type="secondary">{dayjs(commission.createdAt).format('DD.MM.YYYY HH:mm')}</Text>
                    </>
                  ),
                },
                ...(commission.approvedAt
                  ? [{
                      color: 'blue',
                      children: (
                        <>
                          <Text strong>Onaylandı</Text>
                          <br />
                          <Text type="secondary">{dayjs(commission.approvedAt).format('DD.MM.YYYY HH:mm')}</Text>
                        </>
                      ),
                    }]
                  : []),
                ...(commission.paidAt
                  ? [{
                      color: 'green',
                      children: (
                        <>
                          <Text strong>Ödendi</Text>
                          <br />
                          <Text type="secondary">{dayjs(commission.paidAt).format('DD.MM.YYYY HH:mm')}</Text>
                        </>
                      ),
                    }]
                  : []),
                ...(commission.rejectedAt
                  ? [{
                      color: 'red',
                      children: (
                        <>
                          <Text strong>Reddedildi</Text>
                          <br />
                          <Text type="secondary">{dayjs(commission.rejectedAt).format('DD.MM.YYYY HH:mm')}</Text>
                        </>
                      ),
                    }]
                  : []),
              ]}
            />
          </Card>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        title="Komisyonu Reddet"
        open={rejectModalOpen}
        onOk={handleReject}
        onCancel={() => setRejectModalOpen(false)}
        okText="Reddet"
        okType="danger"
        cancelText="Vazgeç"
        confirmLoading={rejectMutation.isPending}
      >
        <Input.TextArea
          placeholder="Red sebebini giriniz..."
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>

      {/* Pay Modal */}
      <Modal
        title="Ödeme Bilgisi"
        open={payModalOpen}
        onOk={handleMarkPaid}
        onCancel={() => setPayModalOpen(false)}
        okText="Ödendi İşaretle"
        cancelText="Vazgeç"
        confirmLoading={markPaidMutation.isPending}
      >
        <Input
          placeholder="Ödeme referansı (opsiyonel)"
          value={paymentRef}
          onChange={(e) => setPaymentRef(e.target.value)}
        />
      </Modal>
    </div>
  );
}
