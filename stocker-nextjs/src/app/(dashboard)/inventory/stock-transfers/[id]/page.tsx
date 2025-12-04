'use client';

import React from 'react';
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
  Timeline,
  Row,
  Col,
  Statistic,
  Modal,
  Divider,
  Progress,
} from 'antd';
import {
  ArrowLeftOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  RocketOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  EditOutlined,
  PrinterOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import {
  useStockTransfer,
  useSubmitStockTransfer,
  useApproveStockTransfer,
  useShipStockTransfer,
  useReceiveStockTransfer,
  useCancelStockTransfer,
} from '@/lib/api/hooks/useInventory';
import type { TransferStatus, StockTransferItemDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusConfig: Record<TransferStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: 'default', label: 'Taslak', icon: <EditOutlined /> },
  Pending: { color: 'processing', label: 'Beklemede', icon: <ClockCircleOutlined /> },
  Approved: { color: 'blue', label: 'Onaylı', icon: <CheckCircleOutlined /> },
  Rejected: { color: 'red', label: 'Reddedildi', icon: <CloseCircleOutlined /> },
  InTransit: { color: 'orange', label: 'Yolda', icon: <RocketOutlined /> },
  Received: { color: 'cyan', label: 'Teslim Alındı', icon: <InboxOutlined /> },
  PartiallyReceived: { color: 'gold', label: 'Kısmi Teslim', icon: <InboxOutlined /> },
  Completed: { color: 'green', label: 'Tamamlandı', icon: <CheckCircleOutlined /> },
  Cancelled: { color: 'red', label: 'İptal', icon: <CloseCircleOutlined /> },
};

const transferTypeLabels: Record<string, string> = {
  Standard: 'Standart',
  Urgent: 'Acil',
  Replenishment: 'İkmal',
  Return: 'İade',
  Internal: 'Dahili',
  CrossDock: 'Cross-Dock',
  Consolidation: 'Konsolidasyon',
};

export default function StockTransferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: transfer, isLoading, error } = useStockTransfer(id);
  const submitTransfer = useSubmitStockTransfer();
  const approveTransfer = useApproveStockTransfer();
  const shipTransfer = useShipStockTransfer();
  const receiveTransfer = useReceiveStockTransfer();
  const cancelTransfer = useCancelStockTransfer();

  const handleSubmit = () => {
    Modal.confirm({
      title: 'Transferi Gönder',
      content: 'Bu transferi onaya göndermek istediğinizden emin misiniz?',
      okText: 'Gönder',
      cancelText: 'İptal',
      onOk: async () => {
        await submitTransfer.mutateAsync(id);
      },
    });
  };

  const handleApprove = () => {
    Modal.confirm({
      title: 'Transferi Onayla',
      content: 'Bu transferi onaylamak istediğinizden emin misiniz?',
      okText: 'Onayla',
      cancelText: 'İptal',
      onOk: async () => {
        await approveTransfer.mutateAsync({ id, approvedByUserId: 1 });
      },
    });
  };

  const handleShip = () => {
    Modal.confirm({
      title: 'Transferi Sevk Et',
      content: 'Bu transferi sevk etmek istediğinizden emin misiniz?',
      okText: 'Sevk Et',
      cancelText: 'İptal',
      onOk: async () => {
        await shipTransfer.mutateAsync({ id, shippedByUserId: 1 });
      },
    });
  };

  const handleReceive = () => {
    Modal.confirm({
      title: 'Transferi Teslim Al',
      content: 'Bu transferi teslim almak istediğinizden emin misiniz?',
      okText: 'Teslim Al',
      cancelText: 'İptal',
      onOk: async () => {
        await receiveTransfer.mutateAsync({ id, receivedByUserId: 1 });
      },
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Transferi İptal Et',
      content: 'Bu transferi iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        await cancelTransfer.mutateAsync({ id, reason: 'Kullanıcı tarafından iptal edildi' });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <Alert
        message="Hata"
        description="Transfer bilgileri yüklenemedi"
        type="error"
        showIcon
        action={<Button onClick={() => router.back()}>Geri Dön</Button>}
      />
    );
  }

  const config = statusConfig[transfer.status];

  const getActionButtons = () => {
    const buttons: React.ReactNode[] = [];

    switch (transfer.status) {
      case 'Draft':
        buttons.push(
          <Button key="submit" type="primary" icon={<SendOutlined />} onClick={handleSubmit}>
            Onaya Gönder
          </Button>,
          <Button key="cancel" danger icon={<CloseCircleOutlined />} onClick={handleCancel}>
            İptal Et
          </Button>
        );
        break;
      case 'Pending':
        buttons.push(
          <Button key="approve" type="primary" icon={<CheckCircleOutlined />} onClick={handleApprove}>
            Onayla
          </Button>,
          <Button key="reject" danger icon={<CloseCircleOutlined />} onClick={handleCancel}>
            Reddet
          </Button>
        );
        break;
      case 'Approved':
        buttons.push(
          <Button key="ship" type="primary" icon={<RocketOutlined />} onClick={handleShip}>
            Sevk Et
          </Button>
        );
        break;
      case 'InTransit':
        buttons.push(
          <Button key="receive" type="primary" icon={<InboxOutlined />} onClick={handleReceive}>
            Teslim Al
          </Button>
        );
        break;
    }

    return buttons;
  };

  const itemColumns: ColumnsType<StockTransferItemDto> = [
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
      title: 'Kaynak Lokasyon',
      dataIndex: 'sourceLocationName',
      key: 'sourceLocationName',
      width: 140,
      render: (name) => name || '-',
    },
    {
      title: 'Hedef Lokasyon',
      dataIndex: 'destinationLocationName',
      key: 'destinationLocationName',
      width: 140,
      render: (name) => name || '-',
    },
    {
      title: 'Talep',
      dataIndex: 'requestedQuantity',
      key: 'requestedQuantity',
      width: 80,
      align: 'right',
    },
    {
      title: 'Sevk',
      dataIndex: 'shippedQuantity',
      key: 'shippedQuantity',
      width: 80,
      align: 'right',
      render: (qty, record) => (
        <span className={qty < record.requestedQuantity ? 'text-orange-500' : 'text-green-600'}>
          {qty}
        </span>
      ),
    },
    {
      title: 'Teslim',
      dataIndex: 'receivedQuantity',
      key: 'receivedQuantity',
      width: 80,
      align: 'right',
      render: (qty, record) => (
        <span className={qty < record.shippedQuantity ? 'text-orange-500' : 'text-green-600'}>
          {qty}
        </span>
      ),
    },
    {
      title: 'Hasarlı',
      dataIndex: 'damagedQuantity',
      key: 'damagedQuantity',
      width: 80,
      align: 'right',
      render: (qty) => (qty > 0 ? <span className="text-red-500">{qty}</span> : '-'),
    },
    {
      title: 'Lot No',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 100,
      render: (lot) => lot || '-',
    },
    {
      title: 'Seri No',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 100,
      render: (serial) => serial || '-',
    },
  ];

  const completionPercent = transfer.totalRequestedQuantity > 0
    ? Math.round((transfer.totalReceivedQuantity / transfer.totalRequestedQuantity) * 100)
    : 0;

  const getTimelineItems = () => {
    const items = [
      {
        color: 'green',
        children: (
          <>
            <Text strong>Oluşturuldu</Text>
            <br />
            <Text type="secondary">{dayjs(transfer.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
          </>
        ),
      },
    ];

    if (transfer.shippedDate) {
      items.push({
        color: 'blue',
        children: (
          <>
            <Text strong>Sevk Edildi</Text>
            <br />
            <Text type="secondary">{dayjs(transfer.shippedDate).format('DD/MM/YYYY HH:mm')}</Text>
          </>
        ),
      });
    }

    if (transfer.receivedDate) {
      items.push({
        color: 'cyan',
        children: (
          <>
            <Text strong>Teslim Alındı</Text>
            <br />
            <Text type="secondary">{dayjs(transfer.receivedDate).format('DD/MM/YYYY HH:mm')}</Text>
          </>
        ),
      });
    }

    if (transfer.completedDate) {
      items.push({
        color: 'green',
        children: (
          <>
            <Text strong>Tamamlandı</Text>
            <br />
            <Text type="secondary">{dayjs(transfer.completedDate).format('DD/MM/YYYY HH:mm')}</Text>
          </>
        ),
      });
    }

    if (transfer.cancelledDate) {
      items.push({
        color: 'red',
        children: (
          <>
            <Text strong>İptal Edildi</Text>
            <br />
            <Text type="secondary">{dayjs(transfer.cancelledDate).format('DD/MM/YYYY HH:mm')}</Text>
            {transfer.cancellationReason && (
              <>
                <br />
                <Text type="secondary">Neden: {transfer.cancellationReason}</Text>
              </>
            )}
          </>
        ),
      });
    }

    return items;
  };

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
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
              >
                <SwapOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">{transfer.transferNumber}</h1>
                  <Tag color={config.color} icon={config.icon}>
                    {config.label}
                  </Tag>
                </div>
                <p className="text-sm text-gray-500 m-0">
                  {transferTypeLabels[transfer.transferType] || transfer.transferType}
                </p>
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
          {/* Transfer Info */}
          <Card className="mb-6">
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <EnvironmentOutlined className="text-blue-500 text-lg" />
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs">Kaynak Depo</Text>
                    <div className="font-medium">{transfer.sourceWarehouseName}</div>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <EnvironmentOutlined className="text-green-500 text-lg" />
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs">Hedef Depo</Text>
                    <div className="font-medium">{transfer.destinationWarehouseName}</div>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider />

            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
              <Descriptions.Item label="Transfer Tarihi">
                {dayjs(transfer.transferDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Transfer Türü">
                {transferTypeLabels[transfer.transferType] || transfer.transferType}
              </Descriptions.Item>
              <Descriptions.Item label="Tahmini Varış">
                {transfer.expectedArrivalDate
                  ? dayjs(transfer.expectedArrivalDate).format('DD/MM/YYYY')
                  : '-'}
              </Descriptions.Item>
              {transfer.description && (
                <Descriptions.Item label="Açıklama" span={3}>
                  {transfer.description}
                </Descriptions.Item>
              )}
              {transfer.notes && (
                <Descriptions.Item label="Notlar" span={3}>
                  {transfer.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Items */}
          <Card title={`Transfer Kalemleri (${transfer.items?.length || 0})`}>
            <Table
              columns={itemColumns}
              dataSource={transfer.items || []}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1000 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <Text strong>Toplam</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong>{transfer.totalRequestedQuantity}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <Text strong>{transfer.totalShippedQuantity}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      <Text strong>{transfer.totalReceivedQuantity}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} colSpan={3} />
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          {/* Stats */}
          <Card className="mb-6">
            <div className="text-center mb-4">
              <Progress
                type="circle"
                percent={completionPercent}
                size={120}
                strokeColor={{ '0%': '#3b82f6', '100%': '#10b981' }}
              />
              <div className="mt-2">
                <Text type="secondary">Tamamlanma Oranı</Text>
              </div>
            </div>

            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Talep"
                  value={transfer.totalRequestedQuantity}
                  valueStyle={{ fontSize: 18 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Sevk"
                  value={transfer.totalShippedQuantity}
                  valueStyle={{ fontSize: 18, color: '#3b82f6' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Teslim"
                  value={transfer.totalReceivedQuantity}
                  valueStyle={{ fontSize: 18, color: '#10b981' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Timeline */}
          <Card title="Transfer Geçmişi">
            <Timeline items={getTimelineItems()} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
