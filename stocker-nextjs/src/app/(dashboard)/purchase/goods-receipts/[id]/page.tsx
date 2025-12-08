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
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  InboxOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PrinterOutlined,
  FileTextOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import {
  useGoodsReceipt,
  useCompleteGoodsReceipt,
  useCancelGoodsReceipt,
  usePassQualityCheck,
  useFailQualityCheck,
} from '@/lib/api/hooks/usePurchase';
import type { GoodsReceiptStatus, GoodsReceiptItemDto } from '@/lib/api/services/purchase.types';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const statusColors: Record<GoodsReceiptStatus, string> = {
  Draft: 'default',
  Pending: 'orange',
  Confirmed: 'blue',
  Completed: 'green',
  Cancelled: 'default',
};

const statusLabels: Record<GoodsReceiptStatus, string> = {
  Draft: 'Taslak',
  Pending: 'Beklemede',
  Confirmed: 'Onaylandı',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal Edildi',
};

const getStatusStep = (status: GoodsReceiptStatus): number => {
  const steps: Record<GoodsReceiptStatus, number> = {
    Draft: 0,
    Pending: 1,
    Confirmed: 2,
    Completed: 3,
    Cancelled: -1,
  };
  return steps[status] ?? 0;
};

const conditionColors: Record<string, string> = {
  Good: 'green',
  Damaged: 'red',
  Defective: 'orange',
  Expired: 'volcano',
  Other: 'default',
};

const conditionLabels: Record<string, string> = {
  Good: 'İyi',
  Damaged: 'Hasarlı',
  Defective: 'Kusurlu',
  Expired: 'Vadesi Geçmiş',
  Other: 'Diğer',
};

export default function GoodsReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const receiptId = params.id as string;

  const { data: receipt, isLoading } = useGoodsReceipt(receiptId);
  const completeReceipt = useCompleteGoodsReceipt();
  const cancelReceipt = useCancelGoodsReceipt();
  const passQC = usePassQualityCheck();
  const failQC = useFailQualityCheck();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="p-8">
        <Empty description="Mal alım belgesi bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/goods-receipts')}>
            Mal Alım Belgelerine Dön
          </Button>
        </div>
      </div>
    );
  }

  const handleComplete = () => {
    completeReceipt.mutate(receiptId);
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Belgeyi İptal Et',
      content: 'Bu mal alım belgesini iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => cancelReceipt.mutate({ id: receiptId, reason: 'Manuel iptal' }),
    });
  };

  const handlePassQC = () => {
    passQC.mutate({ id: receiptId });
  };

  const handleFailQC = () => {
    Modal.confirm({
      title: 'Kalite Kontrol Başarısız',
      content: 'Kalite kontrolü başarısız olarak işaretlemek istediğinizden emin misiniz?',
      okText: 'Başarısız',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => failQC.mutate({ id: receiptId, reason: 'Kalite standartlarını karşılamıyor' }),
    });
  };

  const actionMenuItems = [
    receipt.status === 'Confirmed' && {
      key: 'complete',
      icon: <CheckCircleOutlined />,
      label: 'Tamamla',
      onClick: handleComplete,
    },
    receipt.requiresQualityCheck && !receipt.qualityCheckDate && {
      key: 'passQC',
      icon: <SafetyOutlined />,
      label: 'Kalite Kontrol Geçti',
      onClick: handlePassQC,
    },
    receipt.requiresQualityCheck && !receipt.qualityCheckDate && {
      key: 'failQC',
      icon: <CloseCircleOutlined />,
      label: 'Kalite Kontrol Başarısız',
      danger: true,
      onClick: handleFailQC,
    },
    {
      key: 'print',
      icon: <PrinterOutlined />,
      label: 'Yazdır',
    },
    { type: 'divider' },
    !['Cancelled', 'Completed'].includes(receipt.status) && {
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
      render: (name: string, record: GoodsReceiptItemDto) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Sipariş Miktarı',
      dataIndex: 'orderedQuantity',
      key: 'orderedQuantity',
      align: 'center' as const,
      render: (qty: number, record: GoodsReceiptItemDto) => `${qty} ${record.unit}`,
    },
    {
      title: 'Alınan Miktar',
      dataIndex: 'receivedQuantity',
      key: 'receivedQuantity',
      align: 'center' as const,
      render: (qty: number, record: GoodsReceiptItemDto) => (
        <Text strong className="text-green-600">{qty} {record.unit}</Text>
      ),
    },
    {
      title: 'Kabul Edilen',
      dataIndex: 'acceptedQuantity',
      key: 'acceptedQuantity',
      align: 'center' as const,
      render: (qty: number, record: GoodsReceiptItemDto) => `${qty} ${record.unit}`,
    },
    {
      title: 'Reddedilen',
      dataIndex: 'rejectedQuantity',
      key: 'rejectedQuantity',
      align: 'center' as const,
      render: (qty: number) => qty > 0 ? (
        <Text type="danger">{qty}</Text>
      ) : '-',
    },
    {
      title: 'Durum',
      dataIndex: 'condition',
      key: 'condition',
      align: 'center' as const,
      render: (condition: string) => (
        <Tag color={conditionColors[condition] || 'default'}>
          {conditionLabels[condition] || condition}
        </Tag>
      ),
    },
    {
      title: 'Lot No',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      render: (lot: string) => lot || '-',
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
              onClick={() => router.push('/purchase/goods-receipts')}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                <InboxOutlined style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0 flex items-center gap-2">
                  {receipt.receiptNumber}
                  <Tag color={statusColors[receipt.status as GoodsReceiptStatus]}>
                    {statusLabels[receipt.status as GoodsReceiptStatus]}
                  </Tag>
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {receipt.supplierName} • {dayjs(receipt.receiptDate).format('DD.MM.YYYY')}
                </p>
              </div>
            </div>
          </div>

          <Space>
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
              <Button icon={<MoreOutlined />}>İşlemler</Button>
            </Dropdown>
            {receipt.status === 'Draft' && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => router.push(`/purchase/goods-receipts/${receiptId}/edit`)}
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
            current={getStatusStep(receipt.status as GoodsReceiptStatus)}
            status={receipt.status === 'Cancelled' ? 'error' : 'process'}
            items={[
              { title: 'Taslak', icon: <FileTextOutlined /> },
              { title: 'Beklemede' },
              { title: 'Onaylandı', icon: <CheckCircleOutlined /> },
              { title: 'Tamamlandı', icon: <CheckCircleOutlined /> },
            ]}
          />
        </Card>

        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Toplam Kalem"
                value={(receipt.items || []).length}
                suffix="adet"
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Toplam Paket"
                value={receipt.totalPackages || 0}
                suffix="paket"
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Toplam Ağırlık"
                value={receipt.totalWeight || 0}
                precision={2}
                suffix="kg"
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Kalite Kontrol"
                value={receipt.requiresQualityCheck ? (receipt.qualityCheckDate ? 'Tamamlandı' : 'Bekliyor') : 'Gerekli Değil'}
                valueStyle={{
                  color: receipt.requiresQualityCheck
                    ? (receipt.qualityCheckDate ? '#3f8600' : '#faad14')
                    : '#8c8c8c',
                  fontSize: '16px'
                }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Receipt Items */}
            <Card title="Alınan Kalemler" className="mb-6">
              <Table
                dataSource={receipt.items || []}
                columns={itemColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>

            {/* Notes */}
            {(receipt.notes || receipt.qualityNotes) && (
              <Card title="Notlar" size="small">
                {receipt.notes && (
                  <div className="mb-4">
                    <Text strong>Genel Not:</Text>
                    <Paragraph className="mt-1 mb-0 whitespace-pre-wrap">{receipt.notes}</Paragraph>
                  </div>
                )}
                {receipt.qualityNotes && (
                  <div>
                    <Text strong>Kalite Kontrol Notu:</Text>
                    <Paragraph className="mt-1 mb-0 whitespace-pre-wrap">{receipt.qualityNotes}</Paragraph>
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
                  <a onClick={() => router.push(`/purchase/suppliers/${receipt.supplierId}`)}>
                    {receipt.supplierName}
                  </a>
                </Descriptions.Item>
                {receipt.purchaseOrderNumber && (
                  <Descriptions.Item label="Sipariş No">
                    <a onClick={() => router.push(`/purchase/orders/${receipt.purchaseOrderId}`)}>
                      {receipt.purchaseOrderNumber}
                    </a>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Receipt Info */}
            <Card title="Belge Bilgileri" size="small" className="mb-4">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Belge No">{receipt.receiptNumber}</Descriptions.Item>
                <Descriptions.Item label="Tarih">
                  {dayjs(receipt.receiptDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Tip">{receipt.type}</Descriptions.Item>
                {receipt.warehouseName && (
                  <Descriptions.Item label="Depo">{receipt.warehouseName}</Descriptions.Item>
                )}
                {receipt.deliveryNoteNumber && (
                  <Descriptions.Item label="İrsaliye No">{receipt.deliveryNoteNumber}</Descriptions.Item>
                )}
                {receipt.deliveryDate && (
                  <Descriptions.Item label="Teslim Tarihi">
                    {dayjs(receipt.deliveryDate).format('DD.MM.YYYY')}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Delivery Info */}
            {(receipt.carrierName || receipt.driverName || receipt.vehiclePlate) && (
              <Card title="Taşıma Bilgileri" size="small" className="mb-4">
                <Descriptions column={1} size="small">
                  {receipt.carrierName && (
                    <Descriptions.Item label="Taşıyıcı">{receipt.carrierName}</Descriptions.Item>
                  )}
                  {receipt.driverName && (
                    <Descriptions.Item label="Şoför">{receipt.driverName}</Descriptions.Item>
                  )}
                  {receipt.vehiclePlate && (
                    <Descriptions.Item label="Plaka">{receipt.vehiclePlate}</Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {/* Quality Check Info */}
            {receipt.requiresQualityCheck && receipt.qualityCheckDate && (
              <Card title="Kalite Kontrol" size="small" className="mb-4">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Kontrol Tarihi">
                    {dayjs(receipt.qualityCheckDate).format('DD.MM.YYYY HH:mm')}
                  </Descriptions.Item>
                  {receipt.qualityCheckedByName && (
                    <Descriptions.Item label="Kontrol Eden">{receipt.qualityCheckedByName}</Descriptions.Item>
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
