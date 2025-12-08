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
import { PurchaseOrderPrint } from '@/components/print';
import { ApprovalWorkflow } from '@/components/purchase/workflow';
import type { ApprovalStep, ApprovalHistory } from '@/components/purchase/workflow';
import type { PurchaseOrderStatus, PurchaseOrderItemDto } from '@/lib/api/services/purchase.types';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const statusColors: Record<PurchaseOrderStatus, string> = {
  Draft: 'default',
  PendingApproval: 'orange',
  Confirmed: 'blue',
  Rejected: 'red',
  Sent: 'cyan',
  PartiallyReceived: 'geekblue',
  Received: 'purple',
  Completed: 'green',
  Cancelled: 'default',
  Closed: 'default',
};

const statusLabels: Record<PurchaseOrderStatus, string> = {
  Draft: 'Taslak',
  PendingApproval: 'Onay Bekliyor',
  Confirmed: 'Onaylandı',
  Rejected: 'Reddedildi',
  Sent: 'Gönderildi',
  PartiallyReceived: 'Kısmen Alındı',
  Received: 'Teslim Alındı',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal Edildi',
  Closed: 'Kapatıldı',
};

const getStatusStep = (status: PurchaseOrderStatus): number => {
  const steps: Record<PurchaseOrderStatus, number> = {
    Draft: 0,
    PendingApproval: 1,
    Confirmed: 2,
    Rejected: -1,
    Sent: 3,
    PartiallyReceived: 4,
    Received: 5,
    Completed: 6,
    Cancelled: -1,
    Closed: 6,
  };
  return steps[status] ?? 0;
};

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [printModalVisible, setPrintModalVisible] = useState(false);

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

  const handleApprove = (notes?: string) => {
    approveOrder.mutate({ id: orderId, notes });
  };

  const handleReject = (reason: string) => {
    rejectOrder.mutate({ id: orderId, reason });
  };

  // Build approval workflow steps based on order status
  const approvalSteps: ApprovalStep[] = [
    {
      id: '1',
      order: 1,
      name: 'Onay Talebi',
      status: order.status === 'Draft' ? 'waiting' : 'approved',
      approverRole: 'Talep Eden',
    },
    {
      id: '2',
      order: 2,
      name: 'Yönetici Onayı',
      status: order.status === 'PendingApproval' ? 'pending' :
              order.status === 'Rejected' ? 'rejected' :
              ['Confirmed', 'Sent', 'PartiallyReceived', 'Received', 'Completed', 'Closed'].includes(order.status) ? 'approved' : 'waiting',
      approverName: order.approvedByName,
      approverId: order.approvedById,
      approvalDate: order.approvalDate,
      approverRole: 'Satın Alma Yöneticisi',
    },
    {
      id: '3',
      order: 3,
      name: 'Tedarikçi Onayı',
      status: ['Sent', 'PartiallyReceived', 'Received', 'Completed', 'Closed'].includes(order.status) ? 'approved' :
              order.status === 'Confirmed' ? 'pending' : 'waiting',
      approverRole: 'Tedarikçi',
    },
  ];

  // Build approval history (mock - in real app, this would come from API)
  const approvalHistory: ApprovalHistory[] = [
    ...(order.createdAt ? [{
      id: 'h1',
      action: 'submitted' as const,
      actorName: 'Sistem',
      actorId: 'system',
      timestamp: order.createdAt,
      stepName: 'Sipariş Oluşturuldu',
    }] : []),
    ...(order.approvalDate && order.approvedByName ? [{
      id: 'h2',
      action: 'approved' as const,
      actorName: order.approvedByName,
      actorId: order.approvedById || '',
      timestamp: order.approvalDate,
      stepName: 'Yönetici Onayı',
    }] : []),
    ...(order.sentDate ? [{
      id: 'h3',
      action: 'submitted' as const,
      actorName: 'Sistem',
      actorId: 'system',
      timestamp: order.sentDate,
      stepName: 'Tedarikçiye Gönderildi',
    }] : []),
  ];

  // Determine current approval step
  const getCurrentStep = (): number => {
    if (order.status === 'Draft') return 0;
    if (order.status === 'PendingApproval') return 1;
    if (order.status === 'Confirmed') return 2;
    return 2;
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
    order.status === 'Confirmed' && {
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
      onClick: () => setPrintModalVisible(true),
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
                  <Tag color={statusColors[order.status as PurchaseOrderStatus]}>
                    {statusLabels[order.status as PurchaseOrderStatus]}
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
            current={getStatusStep(order.status as PurchaseOrderStatus)}
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
                value={order.subTotal || 0}
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
                value={order.vatAmount || 0}
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
                        <Text>{(order.subTotal || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
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
                        <Text>{(order.vatAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
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
            {/* Approval Workflow */}
            {order.status !== 'Draft' && (
              <div className="mb-4">
                <ApprovalWorkflow
                  documentType="order"
                  documentNumber={order.orderNumber}
                  documentStatus={order.status}
                  totalAmount={order.totalAmount}
                  currency={order.currency || 'TRY'}
                  steps={approvalSteps}
                  currentStep={getCurrentStep()}
                  history={approvalHistory}
                  canApprove={order.status === 'PendingApproval'}
                  canReject={order.status === 'PendingApproval'}
                  canCancel={!['Cancelled', 'Completed', 'Closed'].includes(order.status)}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onCancel={(reason) => cancelOrder.mutate({ id: orderId, reason })}
                  showHistory={true}
                />
              </div>
            )}

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
                <Descriptions.Item label="Sipariş Tipi">{order.type}</Descriptions.Item>
                <Descriptions.Item label="Para Birimi">{order.currency || 'TRY'}</Descriptions.Item>
                {order.supplierOrderNumber && (
                  <Descriptions.Item label="Tedarikçi Ref.">{order.supplierOrderNumber}</Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Shipping Info */}
            {order.shippingAddress && (
              <Card title="Kargo Bilgileri" size="small" className="mb-4">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Kargo Adresi">
                    {order.shippingAddress}
                  </Descriptions.Item>
                  {order.shippingMethod && (
                    <Descriptions.Item label="Kargo Yöntemi">
                      {order.shippingMethod}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}
          </Col>
        </Row>
      </div>

      {/* Print Modal */}
      {order && (
        <PurchaseOrderPrint
          visible={printModalVisible}
          onClose={() => setPrintModalVisible(false)}
          order={{
            orderNumber: order.orderNumber,
            orderDate: order.orderDate,
            expectedDeliveryDate: order.expectedDeliveryDate,
            supplierName: order.supplierName,
            supplierCode: order.supplierCode,
            status: order.status,
            items: (order.items || []).map((item) => ({
              productCode: item.productCode,
              productName: item.productName,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              taxRate: item.vatRate,
              lineTotal: item.totalAmount,
            })),
            subTotal: order.subTotal || 0,
            discountAmount: order.discountAmount || 0,
            vatAmount: order.vatAmount || 0,
            totalAmount: order.totalAmount || 0,
            currency: order.currency || 'TRY',
            notes: order.notes,
            shippingAddress: order.shippingAddress,
          }}
        />
      )}
    </div>
  );
}
