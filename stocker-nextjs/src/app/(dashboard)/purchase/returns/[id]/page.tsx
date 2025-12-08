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
  Steps,
  Modal,
  Timeline,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  RollbackOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PrinterOutlined,
  SendOutlined,
  DollarOutlined,
  FileTextOutlined,
  CarOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  usePurchaseReturn,
  useApprovePurchaseReturn,
  useRejectPurchaseReturn,
  useCancelPurchaseReturn,
  useShipPurchaseReturn,
  useReceivePurchaseReturn,
  useProcessPurchaseRefund,
  useSubmitReturnForApproval,
} from '@/lib/api/hooks/usePurchase';
import type { PurchaseReturnStatus, PurchaseReturnReason, PurchaseReturnItemDto } from '@/lib/api/services/purchase.types';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const statusColors: Record<PurchaseReturnStatus, string> = {
  Draft: 'default',
  Pending: 'blue',
  Approved: 'cyan',
  Rejected: 'red',
  Shipped: 'geekblue',
  Received: 'purple',
  Completed: 'green',
  Cancelled: 'default',
};

const statusLabels: Record<PurchaseReturnStatus, string> = {
  Draft: 'Taslak',
  Pending: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Shipped: 'Gönderildi',
  Received: 'Teslim Alındı',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
};

const reasonLabels: Record<PurchaseReturnReason, string> = {
  Defective: 'Kusurlu',
  WrongItem: 'Yanlış Ürün',
  WrongQuantity: 'Yanlış Miktar',
  Damaged: 'Hasarlı',
  QualityIssue: 'Kalite Sorunu',
  Expired: 'Vadesi Geçmiş',
  NotAsDescribed: 'Tanımlandığı Gibi Değil',
  Other: 'Diğer',
};

const reasonColors: Record<PurchaseReturnReason, string> = {
  Defective: 'red',
  WrongItem: 'orange',
  WrongQuantity: 'gold',
  Damaged: 'volcano',
  QualityIssue: 'magenta',
  Expired: 'purple',
  NotAsDescribed: 'blue',
  Other: 'default',
};

const typeLabels: Record<string, string> = {
  Standard: 'Standart',
  Defective: 'Kusurlu Ürün',
  Warranty: 'Garanti',
  Exchange: 'Değişim',
};

const refundMethodLabels: Record<string, string> = {
  Credit: 'Alacak',
  BankTransfer: 'Havale/EFT',
  Check: 'Çek',
  Cash: 'Nakit',
  Replacement: 'Ürün Değişimi',
};

const getStatusStep = (status: PurchaseReturnStatus): number => {
  const steps: Record<PurchaseReturnStatus, number> = {
    Draft: 0,
    Pending: 1,
    Approved: 2,
    Shipped: 3,
    Received: 4,
    Completed: 5,
    Rejected: -1,
    Cancelled: -1,
  };
  return steps[status] ?? 0;
};

export default function PurchaseReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const returnId = params.id as string;

  const { data: purchaseReturn, isLoading } = usePurchaseReturn(returnId);
  const approveReturn = useApprovePurchaseReturn();
  const rejectReturn = useRejectPurchaseReturn();
  const cancelReturn = useCancelPurchaseReturn();
  const shipReturn = useShipPurchaseReturn();
  const receiveReturn = useReceivePurchaseReturn();
  const processRefund = useProcessPurchaseRefund();
  const submitForApproval = useSubmitReturnForApproval();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!purchaseReturn) {
    return (
      <div className="p-8">
        <Empty description="İade belgesi bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/returns')}>
            İadelere Dön
          </Button>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    approveReturn.mutate({ id: returnId });
  };

  const handleReject = () => {
    Modal.confirm({
      title: 'İade Talebini Reddet',
      content: 'Bu iade talebini reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => rejectReturn.mutate({ id: returnId, reason: 'Manuel ret' }),
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'İade Talebini İptal Et',
      content: 'Bu iade talebini iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => cancelReturn.mutate({ id: returnId, reason: 'Manuel iptal' }),
    });
  };

  const handleShip = () => {
    Modal.confirm({
      title: 'İade Gönderimi',
      content: 'İadeyi gönderildi olarak işaretlemek istediğinizden emin misiniz?',
      okText: 'Gönder',
      cancelText: 'Vazgeç',
      onOk: () => shipReturn.mutate({
        id: returnId,
        trackingNumber: `TRK-${Date.now()}`,
        shippingCarrier: 'Manuel',
      }),
    });
  };

  const handleReceive = () => {
    receiveReturn.mutate(returnId);
  };

  const handleProcessRefund = () => {
    processRefund.mutate({
      id: returnId,
      amount: purchaseReturn.totalAmount,
      refundReference: `REF-${Date.now()}`,
    });
  };

  const handleSubmitForApproval = () => {
    submitForApproval.mutate(returnId);
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const actionMenuItems = [
    purchaseReturn.status === 'Draft' && {
      key: 'submit',
      icon: <CheckCircleOutlined />,
      label: 'Onaya Gönder',
      onClick: handleSubmitForApproval,
    },
    purchaseReturn.status === 'Pending' && {
      key: 'approve',
      icon: <CheckCircleOutlined />,
      label: 'Onayla',
      onClick: handleApprove,
    },
    purchaseReturn.status === 'Pending' && {
      key: 'reject',
      icon: <CloseCircleOutlined />,
      label: 'Reddet',
      danger: true,
      onClick: handleReject,
    },
    purchaseReturn.status === 'Approved' && {
      key: 'ship',
      icon: <SendOutlined />,
      label: 'Gönder',
      onClick: handleShip,
    },
    purchaseReturn.status === 'Shipped' && {
      key: 'receive',
      icon: <InboxOutlined />,
      label: 'Teslim Alındı',
      onClick: handleReceive,
    },
    purchaseReturn.status === 'Received' && {
      key: 'refund',
      icon: <DollarOutlined />,
      label: 'İade İşle',
      onClick: handleProcessRefund,
    },
    {
      key: 'print',
      icon: <PrinterOutlined />,
      label: 'Yazdır',
    },
    { type: 'divider' },
    !['Cancelled', 'Completed'].includes(purchaseReturn.status) && {
      key: 'cancel',
      icon: <CloseCircleOutlined />,
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
      render: (name: string, record: PurchaseReturnItemDto) => (
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
      render: (qty: number, record: PurchaseReturnItemDto) => `${qty} ${record.unit}`,
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      render: (price: number) => `${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`,
    },
    {
      title: 'KDV',
      key: 'vat',
      align: 'right' as const,
      render: (_: any, record: PurchaseReturnItemDto) => (
        <span>
          %{record.vatRate}
          <div className="text-xs text-gray-500">
            {record.vatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </div>
        </span>
      ),
    },
    {
      title: 'Sebep',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => (
        <Tag color={reasonColors[reason as PurchaseReturnReason] || 'default'}>
          {reasonLabels[reason as PurchaseReturnReason] || reason}
        </Tag>
      ),
    },
    {
      title: 'Toplam',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (amount: number) => (
        <Text strong className="text-red-600">
          {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
        </Text>
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
              onClick={() => router.push('/purchase/returns')}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
              >
                <RollbackOutlined style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0 flex items-center gap-2">
                  {purchaseReturn.returnNumber}
                  <Tag color={statusColors[purchaseReturn.status as PurchaseReturnStatus]}>
                    {statusLabels[purchaseReturn.status as PurchaseReturnStatus]}
                  </Tag>
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {purchaseReturn.supplierName} • {dayjs(purchaseReturn.returnDate).format('DD.MM.YYYY')}
                </p>
              </div>
            </div>
          </div>

          <Space>
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
              <Button icon={<MoreOutlined />}>İşlemler</Button>
            </Dropdown>
            {purchaseReturn.status === 'Draft' && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => router.push(`/purchase/returns/${returnId}/edit`)}
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
            current={getStatusStep(purchaseReturn.status as PurchaseReturnStatus)}
            status={['Rejected', 'Cancelled'].includes(purchaseReturn.status) ? 'error' : 'process'}
            items={[
              { title: 'Taslak', icon: <FileTextOutlined /> },
              { title: 'Onay Bekliyor' },
              { title: 'Onaylandı', icon: <CheckCircleOutlined /> },
              { title: 'Gönderildi', icon: <CarOutlined /> },
              { title: 'Teslim Alındı', icon: <InboxOutlined /> },
              { title: 'Tamamlandı', icon: <DollarOutlined /> },
            ]}
          />
        </Card>

        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="İade Tutarı"
                value={purchaseReturn.totalAmount}
                precision={2}
                suffix={purchaseReturn.currency || 'TRY'}
                valueStyle={{ color: '#ef4444' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="İade Edilen"
                value={purchaseReturn.refundAmount}
                precision={2}
                suffix={purchaseReturn.currency || 'TRY'}
                valueStyle={{ color: purchaseReturn.refundAmount > 0 ? '#22c55e' : '#9ca3af' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="İade Sebebi"
                value={reasonLabels[purchaseReturn.reason as PurchaseReturnReason] || purchaseReturn.reason}
                valueStyle={{ fontSize: '16px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Toplam Kalem"
                value={(purchaseReturn.items || []).length}
                suffix="adet"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Return Items */}
            <Card title="İade Kalemleri" className="mb-6">
              <Table
                dataSource={purchaseReturn.items || []}
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
                        <Text strong>{purchaseReturn.subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <Text>KDV Toplam</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text>{purchaseReturn.vatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row style={{ background: '#fef2f2' }}>
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <Text strong style={{ fontSize: 16 }}>İade Tutarı</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong style={{ fontSize: 16, color: '#ef4444' }}>
                          {purchaseReturn.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {purchaseReturn.currency || '₺'}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Card>

            {/* Notes */}
            {(purchaseReturn.notes || purchaseReturn.internalNotes || purchaseReturn.reasonDetails) && (
              <Card title="Notlar" size="small">
                {purchaseReturn.reasonDetails && (
                  <div className="mb-4">
                    <Text strong>Sebep Detayı:</Text>
                    <Paragraph className="mt-1 mb-0 whitespace-pre-wrap">{purchaseReturn.reasonDetails}</Paragraph>
                  </div>
                )}
                {purchaseReturn.notes && (
                  <div className="mb-4">
                    <Text strong>Genel Not:</Text>
                    <Paragraph className="mt-1 mb-0 whitespace-pre-wrap">{purchaseReturn.notes}</Paragraph>
                  </div>
                )}
                {purchaseReturn.internalNotes && (
                  <div>
                    <Text strong>Dahili Not:</Text>
                    <Paragraph className="mt-1 mb-0 whitespace-pre-wrap">{purchaseReturn.internalNotes}</Paragraph>
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
                  <a onClick={() => router.push(`/purchase/suppliers/${purchaseReturn.supplierId}`)}>
                    {purchaseReturn.supplierName}
                  </a>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Return Info */}
            <Card title="İade Bilgileri" size="small" className="mb-4">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="İade No">{purchaseReturn.returnNumber}</Descriptions.Item>
                {purchaseReturn.rmaNumber && (
                  <Descriptions.Item label="RMA No">{purchaseReturn.rmaNumber}</Descriptions.Item>
                )}
                <Descriptions.Item label="İade Tarihi">
                  {dayjs(purchaseReturn.returnDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Tip">
                  {typeLabels[purchaseReturn.type] || purchaseReturn.type}
                </Descriptions.Item>
                <Descriptions.Item label="Sebep">
                  <Tag color={reasonColors[purchaseReturn.reason as PurchaseReturnReason] || 'default'}>
                    {reasonLabels[purchaseReturn.reason as PurchaseReturnReason] || purchaseReturn.reason}
                  </Tag>
                </Descriptions.Item>
                {purchaseReturn.refundMethod && (
                  <Descriptions.Item label="İade Yöntemi">
                    {refundMethodLabels[purchaseReturn.refundMethod] || purchaseReturn.refundMethod}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Related Documents */}
            {(purchaseReturn.purchaseOrderNumber || purchaseReturn.goodsReceiptNumber || purchaseReturn.purchaseInvoiceNumber) && (
              <Card title="İlişkili Belgeler" size="small" className="mb-4">
                <Descriptions column={1} size="small">
                  {purchaseReturn.purchaseOrderNumber && (
                    <Descriptions.Item label="Sipariş No">
                      <a onClick={() => router.push(`/purchase/orders/${purchaseReturn.purchaseOrderId}`)}>
                        {purchaseReturn.purchaseOrderNumber}
                      </a>
                    </Descriptions.Item>
                  )}
                  {purchaseReturn.goodsReceiptNumber && (
                    <Descriptions.Item label="Mal Alım No">
                      <a onClick={() => router.push(`/purchase/goods-receipts/${purchaseReturn.goodsReceiptId}`)}>
                        {purchaseReturn.goodsReceiptNumber}
                      </a>
                    </Descriptions.Item>
                  )}
                  {purchaseReturn.purchaseInvoiceNumber && (
                    <Descriptions.Item label="Fatura No">
                      <a onClick={() => router.push(`/purchase/invoices/${purchaseReturn.purchaseInvoiceId}`)}>
                        {purchaseReturn.purchaseInvoiceNumber}
                      </a>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {/* Shipping Info */}
            {purchaseReturn.isShipped && (
              <Card title="Gönderim Bilgileri" size="small" className="mb-4">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Durum">
                    <Tag color="green">Gönderildi</Tag>
                  </Descriptions.Item>
                  {purchaseReturn.shippedDate && (
                    <Descriptions.Item label="Gönderim Tarihi">
                      {dayjs(purchaseReturn.shippedDate).format('DD.MM.YYYY')}
                    </Descriptions.Item>
                  )}
                  {purchaseReturn.shippingCarrier && (
                    <Descriptions.Item label="Kargo">{purchaseReturn.shippingCarrier}</Descriptions.Item>
                  )}
                  {purchaseReturn.trackingNumber && (
                    <Descriptions.Item label="Takip No">{purchaseReturn.trackingNumber}</Descriptions.Item>
                  )}
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
                          {dayjs(purchaseReturn.createdAt).format('DD.MM.YYYY HH:mm')}
                        </div>
                      </div>
                    ),
                  },
                  purchaseReturn.approvalDate && {
                    color: 'blue',
                    children: (
                      <div>
                        <Text strong>Onaylandı</Text>
                        {purchaseReturn.approvedByName && (
                          <div className="text-xs">{purchaseReturn.approvedByName}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          {dayjs(purchaseReturn.approvalDate).format('DD.MM.YYYY HH:mm')}
                        </div>
                      </div>
                    ),
                  },
                  purchaseReturn.shippedDate && {
                    color: 'geekblue',
                    children: (
                      <div>
                        <Text strong>Gönderildi</Text>
                        <div className="text-xs text-gray-500">
                          {dayjs(purchaseReturn.shippedDate).format('DD.MM.YYYY HH:mm')}
                        </div>
                      </div>
                    ),
                  },
                  purchaseReturn.receivedDate && {
                    color: 'purple',
                    children: (
                      <div>
                        <Text strong>Teslim Alındı</Text>
                        <div className="text-xs text-gray-500">
                          {dayjs(purchaseReturn.receivedDate).format('DD.MM.YYYY HH:mm')}
                        </div>
                      </div>
                    ),
                  },
                  purchaseReturn.refundDate && {
                    color: 'green',
                    children: (
                      <div>
                        <Text strong>İade Edildi</Text>
                        {purchaseReturn.refundReference && (
                          <div className="text-xs">{purchaseReturn.refundReference}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          {dayjs(purchaseReturn.refundDate).format('DD.MM.YYYY HH:mm')}
                        </div>
                      </div>
                    ),
                  },
                ].filter(Boolean)}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
