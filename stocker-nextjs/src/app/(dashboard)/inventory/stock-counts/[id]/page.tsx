'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Button,
  Space,
  Table,
  Tag,
  Typography,
  Descriptions,
  Spin,
  Alert,
  Row,
  Col,
  Statistic,
  Modal,
  Progress,
  InputNumber,
  Input,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  EditOutlined,
  PrinterOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import {
  useStockCount,
  useStartStockCount,
  useCompleteStockCount,
  useApproveStockCount,
  useCancelStockCount,
  useCountStockCountItem,
} from '@/lib/api/hooks/useInventory';
import type { StockCountStatus, StockCountType, StockCountItemDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusConfig: Record<StockCountStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: 'default', label: 'Taslak', icon: <EditOutlined /> },
  InProgress: { color: 'processing', label: 'Devam Ediyor', icon: <PlayCircleOutlined /> },
  Completed: { color: 'cyan', label: 'Tamamlandı', icon: <CheckCircleOutlined /> },
  Approved: { color: 'green', label: 'Onaylandı', icon: <CheckCircleOutlined /> },
  Rejected: { color: 'red', label: 'Reddedildi', icon: <CloseCircleOutlined /> },
  Adjusted: { color: 'blue', label: 'Düzeltildi', icon: <CheckCircleOutlined /> },
  Cancelled: { color: 'red', label: 'İptal', icon: <CloseCircleOutlined /> },
};

const countTypeLabels: Record<StockCountType, string> = {
  Full: 'Tam Sayım',
  Cycle: 'Periyodik Sayım',
  Spot: 'Anlık Sayım',
  Annual: 'Yıllık Sayım',
  Category: 'Kategori Sayımı',
  Location: 'Lokasyon Sayımı',
  ABC: 'ABC Sayımı',
  Perpetual: 'Sürekli Sayım',
};

export default function StockCountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [countModalVisible, setCountModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockCountItemDto | null>(null);
  const [countedQuantity, setCountedQuantity] = useState<number>(0);
  const [countNotes, setCountNotes] = useState('');

  const { data: stockCount, isLoading, error, refetch } = useStockCount(id);
  const startCount = useStartStockCount();
  const completeCount = useCompleteStockCount();
  const approveCount = useApproveStockCount();
  const cancelCount = useCancelStockCount();
  const recordCount = useCountStockCountItem();

  const handleStart = () => {
    Modal.confirm({
      title: 'Sayımı Başlat',
      content: 'Bu sayımı başlatmak istediğinizden emin misiniz?',
      okText: 'Başlat',
      cancelText: 'İptal',
      onOk: async () => {
        await startCount.mutateAsync({ id, countedByUserId: 1 });
      },
    });
  };

  const handleComplete = () => {
    Modal.confirm({
      title: 'Sayımı Tamamla',
      content: 'Bu sayımı tamamlamak istediğinizden emin misiniz? Tamamlandıktan sonra değişiklik yapılamaz.',
      okText: 'Tamamla',
      cancelText: 'İptal',
      onOk: async () => {
        await completeCount.mutateAsync(id);
      },
    });
  };

  const handleApprove = () => {
    Modal.confirm({
      title: 'Sayımı Onayla',
      content: stockCount?.autoAdjust
        ? 'Bu sayımı onaylamak istediğinizden emin misiniz? Stok farkları otomatik düzeltilecektir.'
        : 'Bu sayımı onaylamak istediğinizden emin misiniz?',
      okText: 'Onayla',
      cancelText: 'İptal',
      onOk: async () => {
        await approveCount.mutateAsync({ id, approvedByUserId: 1 });
      },
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Sayımı İptal Et',
      content: 'Bu sayımı iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        await cancelCount.mutateAsync({ id, reason: 'Kullanıcı tarafından iptal edildi' });
      },
    });
  };

  const handleRecordCount = async () => {
    if (!selectedItem) return;
    try {
      await recordCount.mutateAsync({
        stockCountId: id,
        itemId: selectedItem.id,
        countedQuantity,
        notes: countNotes || undefined,
      });
      setCountModalVisible(false);
      setSelectedItem(null);
      setCountedQuantity(0);
      setCountNotes('');
      refetch();
    } catch (error) {
      // Error handled by hook
    }
  };

  const openCountModal = (item: StockCountItemDto) => {
    setSelectedItem(item);
    setCountedQuantity(item.countedQuantity ?? item.systemQuantity);
    setCountNotes(item.notes || '');
    setCountModalVisible(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !stockCount) {
    return (
      <Alert
        message="Hata"
        description="Sayım bilgileri yüklenemedi"
        type="error"
        showIcon
        action={<Button onClick={() => router.back()}>Geri Dön</Button>}
      />
    );
  }

  const config = statusConfig[stockCount.status];
  const progressPercent = stockCount.totalItems > 0
    ? Math.round((stockCount.countedItems / stockCount.totalItems) * 100)
    : 0;

  const getActionButtons = () => {
    const buttons: React.ReactNode[] = [];

    switch (stockCount.status) {
      case 'Draft':
        buttons.push(
          <Button key="start" type="primary" icon={<PlayCircleOutlined />} onClick={handleStart}>
            Başlat
          </Button>,
          <Button key="cancel" danger icon={<CloseCircleOutlined />} onClick={handleCancel}>
            İptal Et
          </Button>
        );
        break;
      case 'InProgress':
        buttons.push(
          <Button
            key="complete"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleComplete}
            disabled={stockCount.countedItems < stockCount.totalItems}
          >
            Tamamla
          </Button>,
          <Button key="cancel" danger icon={<CloseCircleOutlined />} onClick={handleCancel}>
            İptal Et
          </Button>
        );
        break;
      case 'Completed':
        buttons.push(
          <Button key="approve" type="primary" icon={<CheckCircleOutlined />} onClick={handleApprove}>
            Onayla
          </Button>
        );
        break;
    }

    return buttons;
  };

  const itemColumns: ColumnsType<StockCountItemDto> = [
    {
      title: 'Ürün Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Lokasyon',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 120,
      render: (name) => name || '-',
    },
    {
      title: 'Sistem Stok',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      width: 100,
      align: 'right',
    },
    {
      title: 'Sayılan',
      dataIndex: 'countedQuantity',
      key: 'countedQuantity',
      width: 100,
      align: 'right',
      render: (qty, record) =>
        record.isCounted ? (
          <span className="font-medium">{qty}</span>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Fark',
      dataIndex: 'difference',
      key: 'difference',
      width: 100,
      align: 'right',
      render: (diff, record) => {
        if (!record.isCounted) return '-';
        if (diff === 0) return <span className="text-gray-400">0</span>;
        if (diff > 0)
          return (
            <span className="text-green-600 flex items-center justify-end gap-1">
              <ArrowUpOutlined /> +{diff}
            </span>
          );
        return (
          <span className="text-red-500 flex items-center justify-end gap-1">
            <ArrowDownOutlined /> {diff}
          </span>
        );
      },
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => {
        if (!record.isCounted) {
          return <Tag>Sayılmadı</Tag>;
        }
        if (record.hasDifference) {
          return <Tag color="warning" icon={<ExclamationCircleOutlined />}>Farklı</Tag>;
        }
        return <Tag color="success" icon={<CheckCircleOutlined />}>Eşleşti</Tag>;
      },
    },
    {
      title: 'Lot/Seri',
      key: 'tracking',
      width: 120,
      render: (_, record) => (
        <div className="text-xs text-gray-500">
          {record.lotNumber && <div>Lot: {record.lotNumber}</div>}
          {record.serialNumber && <div>Seri: {record.serialNumber}</div>}
          {!record.lotNumber && !record.serialNumber && '-'}
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_, record) =>
        stockCount.status === 'InProgress' && (
          <Button
            type="primary"
            size="small"
            onClick={() => openCountModal(record)}
          >
            {record.isCounted ? 'Düzenle' : 'Say'}
          </Button>
        ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-6"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          marginTop: '-24px',
          paddingTop: '24px',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
              >
                <FileSearchOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">{stockCount.countNumber}</h1>
                  <Tag color={config.color} icon={config.icon}>
                    {config.label}
                  </Tag>
                </div>
                <p className="text-sm text-gray-500 m-0">{countTypeLabels[stockCount.countType]}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button icon={<PrinterOutlined />}>Yazdır</Button>
            {getActionButtons()}
          </Space>
        </div>
      </div>

      <Row gutter={24}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          {/* Count Info */}
          <Card className="mb-6">
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
              <Descriptions.Item label="Sayım Tarihi">
                {dayjs(stockCount.countDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Depo">{stockCount.warehouseName}</Descriptions.Item>
              <Descriptions.Item label="Lokasyon">
                {stockCount.locationName || 'Tüm Depo'}
              </Descriptions.Item>
              <Descriptions.Item label="Sayım Türü">
                {countTypeLabels[stockCount.countType]}
              </Descriptions.Item>
              <Descriptions.Item label="Otomatik Düzeltme">
                <Tag color={stockCount.autoAdjust ? 'green' : 'default'}>
                  {stockCount.autoAdjust ? 'Evet' : 'Hayır'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">
                {dayjs(stockCount.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              {stockCount.description && (
                <Descriptions.Item label="Açıklama" span={3}>
                  {stockCount.description}
                </Descriptions.Item>
              )}
              {stockCount.notes && (
                <Descriptions.Item label="Notlar" span={3}>
                  {stockCount.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Items */}
          <Card title={`Sayım Kalemleri (${stockCount.items?.length || 0})`}>
            <Table
              columns={itemColumns}
              dataSource={stockCount.items || []}
              rowKey="id"
              pagination={{ pageSize: 20 }}
              scroll={{ x: 1000 }}
              rowClassName={(record) =>
                record.hasDifference ? 'bg-yellow-50' : record.isCounted ? 'bg-green-50' : ''
              }
            />
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          {/* Progress */}
          <Card className="mb-6">
            <div className="text-center mb-4">
              <Progress
                type="circle"
                percent={progressPercent}
                size={120}
                strokeColor={{ '0%': '#8b5cf6', '100%': '#6d28d9' }}
                format={() => `${stockCount.countedItems}/${stockCount.totalItems}`}
              />
              <div className="mt-2">
                <Text type="secondary">Sayım İlerlemesi</Text>
              </div>
            </div>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Toplam Kalem"
                  value={stockCount.totalItems}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Sayılan"
                  value={stockCount.countedItems}
                  valueStyle={{ fontSize: 20, color: '#8b5cf6' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Farklı"
                  value={stockCount.itemsWithDifferenceCount}
                  valueStyle={{
                    fontSize: 20,
                    color: stockCount.itemsWithDifferenceCount > 0 ? '#f59e0b' : '#10b981',
                  }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Net Fark"
                  value={stockCount.totalDifference}
                  valueStyle={{
                    fontSize: 20,
                    color:
                      stockCount.totalDifference > 0
                        ? '#10b981'
                        : stockCount.totalDifference < 0
                        ? '#ef4444'
                        : '#6b7280',
                  }}
                  prefix={
                    stockCount.totalDifference > 0 ? (
                      <ArrowUpOutlined />
                    ) : stockCount.totalDifference < 0 ? (
                      <ArrowDownOutlined />
                    ) : (
                      <MinusOutlined />
                    )
                  }
                />
              </Col>
            </Row>
          </Card>

          {/* Summary Card */}
          <Card title="Özet">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text type="secondary">Sistem Toplam:</Text>
                <Text strong>{stockCount.totalSystemQuantity}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Sayılan Toplam:</Text>
                <Text strong>{stockCount.totalCountedQuantity}</Text>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between">
                <Text type="secondary">Net Fark:</Text>
                <Text
                  strong
                  style={{
                    color:
                      stockCount.totalDifference > 0
                        ? '#10b981'
                        : stockCount.totalDifference < 0
                        ? '#ef4444'
                        : undefined,
                  }}
                >
                  {stockCount.totalDifference > 0 ? '+' : ''}
                  {stockCount.totalDifference}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Count Modal */}
      <Modal
        title={`Sayım: ${selectedItem?.productName}`}
        open={countModalVisible}
        onOk={handleRecordCount}
        onCancel={() => {
          setCountModalVisible(false);
          setSelectedItem(null);
        }}
        confirmLoading={recordCount.isPending}
        okText="Kaydet"
        cancelText="İptal"
      >
        {selectedItem && (
          <div className="py-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <Text type="secondary">Ürün Kodu:</Text>
                <Text strong>{selectedItem.productCode}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Sistem Stok:</Text>
                <Text strong>{selectedItem.systemQuantity}</Text>
              </div>
            </div>

            <div>
              <Text className="block mb-2">Sayılan Miktar:</Text>
              <InputNumber
                value={countedQuantity}
                onChange={(val) => setCountedQuantity(val || 0)}
                min={0}
                style={{ width: '100%' }}
                size="large"
              />
            </div>

            <div>
              <Text className="block mb-2">Not (opsiyonel):</Text>
              <Input.TextArea
                value={countNotes}
                onChange={(e) => setCountNotes(e.target.value)}
                rows={2}
                placeholder="Sayım notu..."
              />
            </div>

            {countedQuantity !== selectedItem.systemQuantity && (
              <Alert
                message={`Fark: ${countedQuantity - selectedItem.systemQuantity > 0 ? '+' : ''}${
                  countedQuantity - selectedItem.systemQuantity
                }`}
                type={countedQuantity > selectedItem.systemQuantity ? 'success' : 'warning'}
                showIcon
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
