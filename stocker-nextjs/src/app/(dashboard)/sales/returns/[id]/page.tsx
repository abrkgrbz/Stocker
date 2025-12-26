'use client';

import React from 'react';
import {
  Card,
  Descriptions,
  Table,
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
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  InboxIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Spinner } from '@/components/primitives';
import { useRouter, useParams } from 'next/navigation';
import {
  useSalesReturn,
  useApproveSalesReturn,
  useRejectSalesReturn,
  useReceiveSalesReturn,
  useCompleteSalesReturn,
} from '@/lib/api/hooks/useSales';
import type { SalesReturnStatus, SalesReturnReason } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusColors: Record<SalesReturnStatus, string> = {
  Draft: 'default',
  Submitted: 'processing',
  Approved: 'cyan',
  Rejected: 'error',
  Received: 'blue',
  Processing: 'geekblue',
  Completed: 'success',
  Cancelled: 'default',
};

const statusLabels: Record<SalesReturnStatus, string> = {
  Draft: 'Taslak',
  Submitted: 'Gönderildi',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Received: 'Teslim Alındı',
  Processing: 'İşleniyor',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
};

const reasonLabels: Record<SalesReturnReason, string> = {
  Defective: 'Arızalı',
  WrongItem: 'Yanlış Ürün',
  NotAsDescribed: 'Tanımlandığı Gibi Değil',
  DamagedInTransit: 'Taşıma Hasarı',
  ChangedMind: 'Vazgeçme',
  Other: 'Diğer',
};

export default function SalesReturnDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');

  const { data: returnData, isLoading } = useSalesReturn(id);
  const approveMutation = useApproveSalesReturn();
  const rejectMutation = useRejectSalesReturn();
  const receiveMutation = useReceiveSalesReturn();
  const completeMutation = useCompleteSalesReturn();

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(id);
      message.success('İade onaylandı');
    } catch {
      message.error('İade onaylanamadı');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.error('Red sebebi girilmelidir');
      return;
    }
    try {
      await rejectMutation.mutateAsync({ id, reason: rejectReason });
      message.success('İade reddedildi');
      setRejectModalOpen(false);
    } catch {
      message.error('İade reddedilemedi');
    }
  };

  const handleReceive = async () => {
    try {
      await receiveMutation.mutateAsync(id);
      message.success('Ürünler teslim alındı');
    } catch {
      message.error('İşlem gerçekleştirilemedi');
    }
  };

  const handleComplete = async () => {
    Modal.confirm({
      title: 'İadeyi Tamamla',
      content: 'Bu iadeyi tamamlamak istediğinizden emin misiniz?',
      okText: 'Tamamla',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await completeMutation.mutateAsync(id);
          message.success('İade tamamlandı');
        } catch {
          message.error('İade tamamlanamadı');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!returnData) {
    return (
      <div style={{ padding: 24 }}>
        <Text type="danger">İade bulunamadı</Text>
      </div>
    );
  }

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      render: (price: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: returnData.currency || 'TRY' }).format(price),
    },
    {
      title: 'Toplam',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      align: 'right' as const,
      render: (total: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: returnData.currency || 'TRY' }).format(total),
    },
    {
      title: 'Stoka Alındı',
      dataIndex: 'isRestocked',
      key: 'isRestocked',
      render: (restocked: boolean) => (
        <Tag color={restocked ? 'success' : 'default'}>{restocked ? 'Evet' : 'Hayır'}</Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/sales/returns')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            İade: {returnData.returnNumber}
          </Title>
          <Tag color={statusColors[returnData.status as SalesReturnStatus]}>
            {statusLabels[returnData.status as SalesReturnStatus]}
          </Tag>
        </Space>
        <Space>
          {returnData.status === 'Draft' && (
            <Button icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/sales/returns/${id}/edit`)}>
              Düzenle
            </Button>
          )}
          {returnData.status === 'Submitted' && (
            <>
              <Button type="primary" icon={<CheckIcon className="w-4 h-4" />} onClick={handleApprove}>
                Onayla
              </Button>
              <Button danger icon={<XMarkIcon className="w-4 h-4" />} onClick={() => setRejectModalOpen(true)}>
                Reddet
              </Button>
            </>
          )}
          {returnData.status === 'Approved' && (
            <Button type="primary" icon={<InboxIcon className="w-4 h-4" />} onClick={handleReceive}>
              Teslim Al
            </Button>
          )}
          {(returnData.status === 'Received' || returnData.status === 'Processing') && (
            <Button type="primary" icon={<CheckIcon className="w-4 h-4" />} onClick={handleComplete}>
              Tamamla
            </Button>
          )}
        </Space>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          {/* Return Info */}
          <Card title="İade Bilgileri" style={{ marginBottom: 24 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="İade No">{returnData.returnNumber}</Descriptions.Item>
              <Descriptions.Item label="Tarih">
                {dayjs(returnData.returnDate).format('DD.MM.YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Sebep">
                <Tag>{reasonLabels[returnData.reason as SalesReturnReason]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusColors[returnData.status as SalesReturnStatus]}>
                  {statusLabels[returnData.status as SalesReturnStatus]}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Order & Customer Info */}
          <Card title="Sipariş & Müşteri Bilgileri" style={{ marginBottom: 24 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Sipariş No">
                <a onClick={() => router.push(`/sales/orders/${returnData.orderId}`)}>
                  {returnData.orderNumber}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Müşteri">{returnData.customerName}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Items */}
          <Card title="İade Kalemleri" style={{ marginBottom: 24 }}>
            <Table
              columns={itemColumns}
              dataSource={returnData.items}
              rowKey="id"
              pagination={false}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} align="right">
                    <strong>Toplam:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong style={{ fontSize: 16, color: '#1890ff' }}>
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: returnData.currency || 'TRY' }).format(returnData.totalAmount ?? returnData.subTotal ?? 0)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} />
                </Table.Summary.Row>
              )}
            />
          </Card>

          {/* Notes */}
          {returnData.notes && (
            <Card title="Notlar">
              <Text>{returnData.notes}</Text>
            </Card>
          )}

          {/* Refund Info */}
          {returnData.refundAmount > 0 && (
            <Card title="İade Bilgisi" style={{ marginTop: 24 }}>
              <Descriptions column={2}>
                <Descriptions.Item label="İade Tutarı">
                  <Text strong style={{ color: '#52c41a' }}>
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: returnData.currency || 'TRY' }).format(returnData.refundAmount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="İade Yöntemi">{returnData.refundMethod || '-'}</Descriptions.Item>
                {returnData.refundedAt && (
                  <Descriptions.Item label="İade Tarihi">
                    {dayjs(returnData.refundedAt).format('DD.MM.YYYY HH:mm')}
                  </Descriptions.Item>
                )}
              </Descriptions>
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
                      <Text type="secondary">{dayjs(returnData.createdAt).format('DD.MM.YYYY HH:mm')}</Text>
                    </>
                  ),
                },
                ...(returnData.submittedAt
                  ? [{
                      color: 'blue',
                      children: (
                        <>
                          <Text strong>Gönderildi</Text>
                          <br />
                          <Text type="secondary">{dayjs(returnData.submittedAt).format('DD.MM.YYYY HH:mm')}</Text>
                        </>
                      ),
                    }]
                  : []),
                ...(returnData.approvedAt
                  ? [{
                      color: 'cyan',
                      children: (
                        <>
                          <Text strong>Onaylandı</Text>
                          <br />
                          <Text type="secondary">{dayjs(returnData.approvedAt).format('DD.MM.YYYY HH:mm')}</Text>
                        </>
                      ),
                    }]
                  : []),
                ...(returnData.receivedAt
                  ? [{
                      color: 'purple',
                      children: (
                        <>
                          <Text strong>Teslim Alındı</Text>
                          <br />
                          <Text type="secondary">{dayjs(returnData.receivedAt).format('DD.MM.YYYY HH:mm')}</Text>
                        </>
                      ),
                    }]
                  : []),
                ...(returnData.completedAt
                  ? [{
                      color: 'green',
                      children: (
                        <>
                          <Text strong>Tamamlandı</Text>
                          <br />
                          <Text type="secondary">{dayjs(returnData.completedAt).format('DD.MM.YYYY HH:mm')}</Text>
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
        title="İadeyi Reddet"
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
    </div>
  );
}
