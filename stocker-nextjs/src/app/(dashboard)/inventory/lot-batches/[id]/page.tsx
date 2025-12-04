'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Typography,
  Spin,
  Modal,
  Empty,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  Input,
  Form,
  Divider,
  Timeline,
} from 'antd';
import {
  ArrowLeftOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  StopOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  useLotBatch,
  useApproveLotBatch,
  useQuarantineLotBatch,
} from '@/lib/api/hooks/useInventory';
import { LotBatchStatus } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

const statusConfig: Record<LotBatchStatus, { color: string; label: string; icon: React.ReactNode }> = {
  [LotBatchStatus.Pending]: { color: 'orange', label: 'Beklemede', icon: <ExclamationCircleOutlined /> },
  [LotBatchStatus.Received]: { color: 'blue', label: 'Alındı', icon: <InboxOutlined /> },
  [LotBatchStatus.Approved]: { color: 'green', label: 'Onaylandı', icon: <CheckCircleOutlined /> },
  [LotBatchStatus.Quarantined]: { color: 'red', label: 'Karantinada', icon: <StopOutlined /> },
  [LotBatchStatus.Rejected]: { color: 'red', label: 'Reddedildi', icon: <StopOutlined /> },
  [LotBatchStatus.Exhausted]: { color: 'default', label: 'Tükendi', icon: <InboxOutlined /> },
  [LotBatchStatus.Expired]: { color: 'default', label: 'Süresi Doldu', icon: <WarningOutlined /> },
  [LotBatchStatus.Recalled]: { color: 'volcano', label: 'Geri Çağrıldı', icon: <WarningOutlined /> },
};

export default function LotBatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lotBatchId = Number(params.id);

  const [quarantineModalOpen, setQuarantineModalOpen] = useState(false);
  const [quarantineReason, setQuarantineReason] = useState('');

  const { data: lotBatch, isLoading } = useLotBatch(lotBatchId);
  const approveLotBatch = useApproveLotBatch();
  const quarantineLotBatch = useQuarantineLotBatch();

  const handleApprove = async () => {
    try {
      await approveLotBatch.mutateAsync(lotBatchId);
    } catch {
      // Error handled by mutation
    }
  };

  const handleQuarantine = async () => {
    if (!quarantineReason.trim()) return;
    try {
      await quarantineLotBatch.mutateAsync({
        id: lotBatchId,
        request: { reason: quarantineReason },
      });
      setQuarantineModalOpen(false);
      setQuarantineReason('');
    } catch {
      // Error handled by mutation
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!lotBatch) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Lot/Parti bulunamadı" />
      </div>
    );
  }

  const statusInfo = statusConfig[lotBatch.status];
  const usagePercentage = lotBatch.initialQuantity > 0
    ? ((lotBatch.initialQuantity - lotBatch.currentQuantity) / lotBatch.initialQuantity) * 100
    : 0;

  return (
    <div className="max-w-5xl mx-auto">
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
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <InboxOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">{lotBatch.lotNumber}</h1>
                  <Tag color={statusInfo.color} icon={statusInfo.icon}>
                    {statusInfo.label}
                  </Tag>
                  {lotBatch.isQuarantined && <Tag color="red">Karantina</Tag>}
                  {lotBatch.isExpired && <Tag color="default">Süresi Doldu</Tag>}
                </div>
                <p className="text-sm text-gray-500 m-0">
                  {lotBatch.productName} ({lotBatch.productCode})
                </p>
              </div>
            </div>
          </div>
          <Space>
            {lotBatch.status === 'Pending' && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
                loading={approveLotBatch.isPending}
                style={{ background: '#10b981', borderColor: '#10b981' }}
              >
                Onayla
              </Button>
            )}
            {lotBatch.status === 'Approved' && !lotBatch.isQuarantined && (
              <Button
                danger
                icon={<StopOutlined />}
                onClick={() => setQuarantineModalOpen(true)}
              >
                Karantinaya Al
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* Alerts */}
      {lotBatch.isExpired && (
        <Alert
          message="Son Kullanma Tarihi Geçmiş"
          description="Bu lot/parti'nin son kullanma tarihi geçmiştir."
          type="error"
          showIcon
          className="mb-6"
        />
      )}

      {lotBatch.daysUntilExpiry !== undefined && lotBatch.daysUntilExpiry > 0 && lotBatch.daysUntilExpiry <= 30 && (
        <Alert
          message={`Son kullanma tarihine ${lotBatch.daysUntilExpiry} gün kaldı`}
          type="warning"
          showIcon
          className="mb-6"
        />
      )}

      {lotBatch.isQuarantined && (
        <Alert
          message="Karantinada"
          description={lotBatch.quarantineReason || 'Bu lot karantinaya alınmış durumda.'}
          type="error"
          showIcon
          className="mb-6"
        />
      )}

      {/* Stats */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Başlangıç Miktarı"
              value={lotBatch.initialQuantity}
              valueStyle={{ color: '#6366f1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Mevcut Miktar"
              value={lotBatch.currentQuantity}
              valueStyle={{ color: lotBatch.currentQuantity > 0 ? '#10b981' : '#ef4444' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Rezerve"
              value={lotBatch.reservedQuantity}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Kullanılabilir"
              value={lotBatch.availableQuantity}
              valueStyle={{ color: lotBatch.availableQuantity > 0 ? '#10b981' : '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <Card title="Lot Bilgileri" className="mb-6">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Lot Numarası">{lotBatch.lotNumber}</Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusInfo.color} icon={statusInfo.icon}>
                  {statusInfo.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ürün">{lotBatch.productName}</Descriptions.Item>
              <Descriptions.Item label="Ürün Kodu">{lotBatch.productCode}</Descriptions.Item>
              <Descriptions.Item label="Tedarikçi">
                {lotBatch.supplierName || <Text type="secondary">-</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Tedarikçi Lot No">
                {lotBatch.supplierLotNumber || <Text type="secondary">-</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Sertifika No">
                {lotBatch.certificateNumber || <Text type="secondary">-</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Notlar" span={2}>
                {lotBatch.notes || <Text type="secondary">-</Text>}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Usage */}
          <Card title="Kullanım Durumu" className="mb-6">
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <Text>Kullanılan</Text>
                <Text strong>
                  {lotBatch.initialQuantity - lotBatch.currentQuantity} / {lotBatch.initialQuantity}
                </Text>
              </div>
              <Progress
                percent={usagePercentage}
                status={usagePercentage >= 100 ? 'exception' : 'normal'}
                strokeColor={{
                  '0%': '#10b981',
                  '100%': '#ef4444',
                }}
              />
            </div>

            <Row gutter={16}>
              <Col span={8}>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {lotBatch.currentQuantity}
                  </div>
                  <Text type="secondary">Mevcut</Text>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">
                    {lotBatch.reservedQuantity}
                  </div>
                  <Text type="secondary">Rezerve</Text>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">
                    {lotBatch.availableQuantity}
                  </div>
                  <Text type="secondary">Kullanılabilir</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          {/* Dates */}
          <Card title="Tarihler" className="mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CalendarOutlined style={{ color: '#6b7280', fontSize: 18 }} />
                <div>
                  <Text type="secondary" className="block text-xs">
                    Üretim Tarihi
                  </Text>
                  <Text>
                    {lotBatch.manufacturedDate
                      ? dayjs(lotBatch.manufacturedDate).format('DD/MM/YYYY')
                      : '-'}
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarOutlined style={{ color: '#6b7280', fontSize: 18 }} />
                <div>
                  <Text type="secondary" className="block text-xs">
                    Alım Tarihi
                  </Text>
                  <Text>
                    {lotBatch.receivedDate
                      ? dayjs(lotBatch.receivedDate).format('DD/MM/YYYY')
                      : '-'}
                  </Text>
                </div>
              </div>

              <Divider className="my-2" />

              <div className="flex items-center gap-3">
                <CalendarOutlined
                  style={{
                    color: lotBatch.isExpired ? '#ef4444' : '#6b7280',
                    fontSize: 18,
                  }}
                />
                <div>
                  <Text type="secondary" className="block text-xs">
                    Son Kullanma Tarihi
                  </Text>
                  <Text
                    style={{
                      color: lotBatch.isExpired ? '#ef4444' : undefined,
                    }}
                  >
                    {lotBatch.expiryDate
                      ? dayjs(lotBatch.expiryDate).format('DD/MM/YYYY')
                      : '-'}
                  </Text>
                  {lotBatch.daysUntilExpiry !== undefined && lotBatch.daysUntilExpiry > 0 && (
                    <Text type="secondary" className="block text-xs">
                      ({lotBatch.daysUntilExpiry} gün kaldı)
                    </Text>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Quarantine Info */}
          {lotBatch.isQuarantined && (
            <Card title="Karantina Bilgileri" className="mb-6">
              <div className="space-y-3">
                <div>
                  <Text type="secondary" className="block text-xs">
                    Karantina Tarihi
                  </Text>
                  <Text>
                    {lotBatch.quarantinedDate
                      ? dayjs(lotBatch.quarantinedDate).format('DD/MM/YYYY HH:mm')
                      : '-'}
                  </Text>
                </div>
                <div>
                  <Text type="secondary" className="block text-xs">
                    Sebep
                  </Text>
                  <Text>{lotBatch.quarantineReason || '-'}</Text>
                </div>
              </div>
            </Card>
          )}

          {/* Inspection Info */}
          {lotBatch.inspectedDate && (
            <Card title="Denetim Bilgileri">
              <div className="space-y-3">
                <div>
                  <Text type="secondary" className="block text-xs">
                    Denetim Tarihi
                  </Text>
                  <Text>
                    {dayjs(lotBatch.inspectedDate).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </div>
                {lotBatch.inspectionNotes && (
                  <div>
                    <Text type="secondary" className="block text-xs">
                      Denetim Notları
                    </Text>
                    <Text>{lotBatch.inspectionNotes}</Text>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Quarantine Modal */}
      <Modal
        title="Karantinaya Al"
        open={quarantineModalOpen}
        onCancel={() => {
          setQuarantineModalOpen(false);
          setQuarantineReason('');
        }}
        onOk={handleQuarantine}
        okText="Karantinaya Al"
        cancelText="İptal"
        okButtonProps={{
          danger: true,
          loading: quarantineLotBatch.isPending,
          disabled: !quarantineReason.trim(),
        }}
      >
        <Form layout="vertical">
          <Form.Item
            label="Karantina Sebebi"
            required
            help="Bu lot/parti neden karantinaya alınıyor?"
          >
            <TextArea
              rows={3}
              value={quarantineReason}
              onChange={(e) => setQuarantineReason(e.target.value)}
              placeholder="Karantina sebebini açıklayın..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
