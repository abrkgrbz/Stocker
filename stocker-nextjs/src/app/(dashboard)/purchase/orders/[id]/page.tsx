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
  Table,
  Empty,
  Dropdown,
  Space,
  Timeline,
  Steps,
  Divider,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  ShoppingCartOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  PrinterOutlined,
  FileTextOutlined,
  TruckOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  usePurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useSendPurchaseOrder,
  useConfirmPurchaseOrder,
  useCancelPurchaseOrder,
  useCompletePurchaseOrder,
} from '@/lib/api/hooks/usePurchase';
import type { PurchaseOrderStatus, PurchaseOrderItemDto } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const statusColors: Record<PurchaseOrderStatus, string> = {
  Draft: 'default',
  PendingApproval: 'orange',
  Approved: 'blue',
  Rejected: 'red',
  Sent: 'cyan',
  Confirmed: 'purple',
  PartiallyReceived: 'geekblue',
  Received: 'green',
  Completed: 'green',
  Cancelled: 'default',
  Closed: 'default',
};

const statusLabels: Record<PurchaseOrderStatus, string> = {
  Draft: 'Taslak',
  PendingApproval: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Sent: 'Gönderildi',
  Confirmed: 'Tedarikçi Onayladı',
  PartiallyReceived: 'Kısmen Alındı',
  Received: 'Teslim Alındı',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal Edildi',
  Closed: 'Kapatıldı',
};

const getStatusStep = (status: PurchaseOrderStatus): number => {
  const steps: Record<string, number> = {
    Draft: 0,
    PendingApproval: 1,
    Approved: 2,
    Rejected: -1,
    Sent: 3,
    Confirmed: 4,
    PartiallyReceived: 5,
    Received: 6,
    Completed: 7,
    Cancelled: -1,
    Closed: 7,
  };
  return steps[status] ?? 0;
};

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data: order, isLoading } = usePurchaseOrder(orderId);
  const approveOrder = useApprovePurchaseOrder();
  const rejectOrder = useRejectPurchaseOrder();
  const sendOrder = useSendPurchaseOrder();
  const confirmOrder = useConfirmPurchaseOrder();
  const cancelOrder = useCancelPurchaseOrder();
  const completeOrder = useCompletePurchaseOrder();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8">
        <Empty description="Sipariş bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/orders')}>
            Siparişlere Dön
          </Button>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    approveOrder.mutate({ id: orderId });
  };

  const handleReject = () => {
    Modal.confirm({
      title: 'Siparişi Reddet',
      content: 'Bu siparişi reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => rejectOrder.mutate({ id: orderId, reason: 'Manual rejection' }),
    });
  };

  const handleSend = () => {
    sendOrder.mutate(orderId);
  };

  const handleConfirm = () => {
    confirmOrder.mutate(orderId);
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Siparişi İptal Et',
      content: 'Bu siparişi iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => cancelOrder.mutate({ id: orderId, reason: 'Manual cancellation' }),
    });
  };

  const handleComplete = () => {
    completeOrder.mutate(orderId);
  };

  const actionMenuItems = [
    order.status === 'PendingApproval' && {
      key: 'approve',
      icon: <CheckCircleOutlined />,
      label: 'Onayla',
      onClick: handleApprove,
    },
    order.status === 'PendingApproval' && {
      key: 'reject',
      icon: <CloseCircleOutlined />,
      label: 'Reddet',
      danger: true,
      onClick: handleReject,
    },
    order.status === 'Approved' && {
      key: 'send',
      icon: <SendOutlined />,
      label: 'Tedarikçiye Gönder',
      onClick: handleSend,
    },
    order.status === 'Sent' && {
      key: 'confirm',
      icon: <CheckCircleOutlined />,
      label: 'Tedarikçi Onayı',
      onClick: handleConfirm,
    },
    {
      key: 'print',
      icon: <PrinterOutlined />,
      label: 'Yazdır',
    },
    { type: 'divider' },
    !['Cancelled', 'Completed', 'Closed'].includes(order.status) && {
      key: 'cancel',
      icon: <CloseCircleOutlined />,
      label: 'İptal Et',
      danger: true,
      onClick: handleCancel,
    },
    order.status === 'Received' && {
      key: 'complete',
      icon: <CheckCircleOutlined />,
      label: 'Tamamla',
      onClick: handleComplete,
    },
  ].filter(Boolean);

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
      render: (name: string, record: PurchaseOrderItemDto) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Miktar',
      key: 'quantity',
      align: 'center' as const,
      render: (record: PurchaseOrderItemDto) => (
        <div>
          <div>{record.quantity} {record.unit}</div>
          {record.receivedQuantity !== undefined && record.receivedQuantity > 0 && (
            <div className="text-xs text-green-600">
              Alınan: {record.receivedQuantity}
            </div>
          )}
        </div>
      ),
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
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      align: 'center' as const,
      render: (discount: number) => discount ? `%${discount}` : '-',
    },
    {
      title: 'KDV',
      dataIndex: 'taxRate',
      key: 'taxRate',
      align: 'center' as const,
      render: (rate: number) => `%${rate || 18}`,
    },
    {
      title: 'Tutar',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      align: 'right' as const,
      render: (total: number) => (
        <Text strong>{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
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
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/purchase/orders')}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}
              >
                <ShoppingCartOutlined style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0 flex items-center gap-2">
                  {order.orderNumber}
                  <Tag color={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Tag>
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {order.supplierName} • {dayjs(order.orderDate).format('DD.MM.YYYY')}
                </p>
              </div>
            </div>
          </div>

          <Space>
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
              <Button icon={<MoreOutlined />}>İşlemler</Button>
            </Dropdown>
            {order.status === 'Draft' && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => router.push(`/purchase/orders/${orderId}/edit`)}
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
            current={getStatusStep(order.status)}
            status={['Rejected', 'Cancelled'].includes(order.status) ? 'error' : 'process'}
            items={[
              { title: 'Taslak', icon: <FileTextOutlined /> },
              { title: 'Onay Bekliyor' },
              { title: 'Onaylandı', icon: <CheckCircleOutlined /> },
              { title: 'Gönderildi', icon: <SendOutlined /> },
              { title: 'Tedarikçi Onayı' },
              { title: 'Kısmen Alındı', icon: <InboxOutlined /> },
              { title: 'Teslim Alındı', icon: <TruckOutlined /> },
              { title: 'Tamamlandı', icon: <CheckCircleOutlined /> },
            ]}
          />
        </Card>

        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Ara Toplam"
                value={order.subtotal || 0}
                precision={2}
                suffix="₺"
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="İskonto"
                value={order.discountAmount || 0}
                precision={2}
                suffix="₺"
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="KDV"
                value={order.taxAmount || 0}
                precision={2}
                suffix="₺"
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Genel Toplam"
                value={order.totalAmount || 0}
                precision={2}
                suffix={order.currency || '₺'}
                valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Order Items */}
            <Card title="Sipariş Kalemleri" className="mb-6">
              <Table
                dataSource={order.items || []}
                columns={itemColumns}
                rowKey="id"
                pagination={false}
                size="small"
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <Text strong>Ara Toplam:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text>{(order.subtotal || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    {order.discountAmount > 0 && (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={6} align="right">
                          <Text>İskonto:</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <Text type="danger">-{(order.discountAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    )}
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <Text>KDV:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text>{(order.taxAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <Text strong>Genel Toplam:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong style={{ color: '#3f8600', fontSize: '16px' }}>
                          {(order.totalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.currency || '₺'}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card title="Notlar" size="small">
                <Paragraph className="mb-0 whitespace-pre-wrap">{order.notes}</Paragraph>
              </Card>
            )}
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            {/* Supplier Info */}
            <Card title="Tedarikçi Bilgileri" size="small" className="mb-4">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Tedarikçi">
                  <a onClick={() => router.push(`/purchase/suppliers/${order.supplierId}`)}>
                    {order.supplierName}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="Kod">{order.supplierCode}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Order Info */}
            <Card title="Sipariş Bilgileri" size="small" className="mb-4">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Sipariş No">{order.orderNumber}</Descriptions.Item>
                <Descriptions.Item label="Sipariş Tarihi">
                  {dayjs(order.orderDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Beklenen Teslim">
                  {order.expectedDeliveryDate
                    ? dayjs(order.expectedDeliveryDate).format('DD.MM.YYYY')
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Sipariş Tipi">{order.orderType}</Descriptions.Item>
                <Descriptions.Item label="Para Birimi">{order.currency || 'TRY'}</Descriptions.Item>
                {order.supplierReference && (
                  <Descriptions.Item label="Tedarikçi Ref.">{order.supplierReference}</Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Delivery Info */}
            {order.deliveryAddress && (
              <Card title="Teslim Bilgileri" size="small" className="mb-4">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Teslim Adresi">
                    {order.deliveryAddress}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Receive Progress */}
            {order.status !== 'Draft' && order.status !== 'Cancelled' && (
              <Card title="Teslim Durumu" size="small">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Teslim Alınan</span>
                    <span className="font-medium">{order.receivedPercentage || 0}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${order.receivedPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
