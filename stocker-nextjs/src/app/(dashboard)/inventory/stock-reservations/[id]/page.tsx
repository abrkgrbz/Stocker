'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Button,
  Space,
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
  DatePicker,
  Divider,
  Timeline,
} from 'antd';
import {
  ArrowLeftOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import {
  useStockReservation,
  useFulfillStockReservation,
  useCancelStockReservation,
  useExtendStockReservation,
} from '@/lib/api/hooks/useInventory';
import type { ReservationStatus, ReservationType } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusConfig: Record<ReservationStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Active: { color: 'processing', label: 'Aktif', icon: <LockOutlined /> },
  PartiallyFulfilled: { color: 'warning', label: 'Kısmen Karşılandı', icon: <ClockCircleOutlined /> },
  Fulfilled: { color: 'success', label: 'Karşılandı', icon: <CheckCircleOutlined /> },
  Cancelled: { color: 'default', label: 'İptal Edildi', icon: <CloseCircleOutlined /> },
  Expired: { color: 'error', label: 'Süresi Doldu', icon: <ClockCircleOutlined /> },
};

const reservationTypeLabels: Record<ReservationType, string> = {
  SalesOrder: 'Satış Siparişi',
  Production: 'Üretim',
  Transfer: 'Transfer',
  Manual: 'Manuel',
  Project: 'Proje',
  Assembly: 'Montaj',
  Service: 'Servis',
};

export default function StockReservationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [fulfillModalVisible, setFulfillModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [fulfillQuantity, setFulfillQuantity] = useState(0);
  const [cancelReason, setCancelReason] = useState('');
  const [extendDate, setExtendDate] = useState<dayjs.Dayjs | null>(null);

  const { data: reservation, isLoading, error } = useStockReservation(id);
  const fulfillReservation = useFulfillStockReservation();
  const cancelReservation = useCancelStockReservation();
  const extendReservation = useExtendStockReservation();

  const handleFulfill = async () => {
    try {
      await fulfillReservation.mutateAsync({
        id,
        quantity: fulfillQuantity,
      });
      setFulfillModalVisible(false);
      setFulfillQuantity(0);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = async () => {
    try {
      await cancelReservation.mutateAsync({
        id,
        reason: cancelReason || undefined,
      });
      setCancelModalVisible(false);
      setCancelReason('');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleExtend = async () => {
    if (!extendDate) return;
    try {
      await extendReservation.mutateAsync({
        id,
        newExpirationDate: extendDate.toISOString(),
      });
      setExtendModalVisible(false);
      setExtendDate(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <Alert
        message="Hata"
        description="Rezervasyon bilgileri yüklenemedi"
        type="error"
        showIcon
        action={<Button onClick={() => router.back()}>Geri Dön</Button>}
      />
    );
  }

  const config = statusConfig[reservation.status];
  const fulfillmentPercent = reservation.quantity > 0
    ? Math.round((reservation.fulfilledQuantity / reservation.quantity) * 100)
    : 0;

  const isExpiringSoon = reservation.expirationDate &&
    dayjs(reservation.expirationDate).diff(dayjs(), 'day') <= 3 &&
    reservation.status === 'Active';

  const getActionButtons = () => {
    const buttons: React.ReactNode[] = [];

    if (reservation.status === 'Active' || reservation.status === 'PartiallyFulfilled') {
      buttons.push(
        <Button
          key="fulfill"
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => {
            setFulfillQuantity(reservation.remainingQuantity);
            setFulfillModalVisible(true);
          }}
        >
          Karşıla
        </Button>,
        <Button
          key="extend"
          icon={<ClockCircleOutlined />}
          onClick={() => {
            setExtendDate(
              reservation.expirationDate
                ? dayjs(reservation.expirationDate).add(7, 'day')
                : dayjs().add(7, 'day')
            );
            setExtendModalVisible(true);
          }}
        >
          Süre Uzat
        </Button>,
        <Button
          key="cancel"
          danger
          icon={<CloseCircleOutlined />}
          onClick={() => setCancelModalVisible(true)}
        >
          İptal Et
        </Button>
      );
    }

    return buttons;
  };

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
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
              >
                <LockOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {reservation.reservationNumber}
                  </h1>
                  <Tag color={config.color} icon={config.icon}>
                    {config.label}
                  </Tag>
                  {isExpiringSoon && (
                    <Tag color="warning">Süresi Yakında Doluyor</Tag>
                  )}
                </div>
                <p className="text-sm text-gray-500 m-0">
                  {reservationTypeLabels[reservation.reservationType]}
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
          {/* Product Info */}
          <Card className="mb-6">
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ background: '#f9731615' }}
              >
                <AppstoreOutlined style={{ fontSize: 28, color: '#f97316' }} />
              </div>
              <div className="flex-1">
                <Text type="secondary" className="text-xs">Rezerve Edilen Ürün</Text>
                <div className="text-lg font-semibold">{reservation.productName}</div>
                <Text type="secondary">{reservation.productCode}</Text>
              </div>
            </div>

            <Divider />

            <Row gutter={24}>
              <Col span={12}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <EnvironmentOutlined className="text-blue-500" />
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs">Depo</Text>
                    <div className="font-medium">{reservation.warehouseName}</div>
                  </div>
                </div>
              </Col>
              {reservation.locationName && (
                <Col span={12}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <EnvironmentOutlined className="text-green-500" />
                    </div>
                    <div>
                      <Text type="secondary" className="text-xs">Lokasyon</Text>
                      <div className="font-medium">{reservation.locationName}</div>
                    </div>
                  </div>
                </Col>
              )}
            </Row>
          </Card>

          {/* Details */}
          <Card title="Rezervasyon Detayları">
            <Descriptions column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label="Rezervasyon Tarihi">
                {dayjs(reservation.reservationDate).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Son Geçerlilik">
                {reservation.expirationDate ? (
                  <span className={isExpiringSoon ? 'text-orange-500 font-medium' : ''}>
                    {dayjs(reservation.expirationDate).format('DD/MM/YYYY')}
                  </span>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Rezervasyon Türü">
                {reservationTypeLabels[reservation.reservationType]}
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">
                {dayjs(reservation.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              {reservation.referenceDocumentType && (
                <>
                  <Descriptions.Item label="Referans Döküman Türü">
                    {reservation.referenceDocumentType}
                  </Descriptions.Item>
                  <Descriptions.Item label="Referans Döküman No">
                    {reservation.referenceDocumentNumber || '-'}
                  </Descriptions.Item>
                </>
              )}
              {reservation.notes && (
                <Descriptions.Item label="Notlar" span={2}>
                  {reservation.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          {/* Progress */}
          <Card className="mb-6">
            <div className="text-center mb-4">
              <Progress
                type="circle"
                percent={fulfillmentPercent}
                size={120}
                strokeColor={{
                  '0%': '#f97316',
                  '100%': '#10b981',
                }}
                format={() => (
                  <div>
                    <div className="text-2xl font-bold">{reservation.fulfilledQuantity}</div>
                    <div className="text-xs text-gray-400">/ {reservation.quantity}</div>
                  </div>
                )}
              />
              <div className="mt-2">
                <Text type="secondary">Karşılanma Durumu</Text>
              </div>
            </div>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Toplam"
                  value={reservation.quantity}
                  valueStyle={{ fontSize: 18 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Karşılanan"
                  value={reservation.fulfilledQuantity}
                  valueStyle={{ fontSize: 18, color: '#10b981' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Kalan"
                  value={reservation.remainingQuantity}
                  valueStyle={{
                    fontSize: 18,
                    color: reservation.remainingQuantity > 0 ? '#f97316' : '#10b981',
                  }}
                />
              </Col>
            </Row>
          </Card>

          {/* Timeline */}
          <Card title="Geçmiş">
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <>
                      <Text strong>Oluşturuldu</Text>
                      <br />
                      <Text type="secondary" className="text-xs">
                        {dayjs(reservation.createdAt).format('DD/MM/YYYY HH:mm')}
                      </Text>
                    </>
                  ),
                },
                ...(reservation.fulfilledQuantity > 0
                  ? [
                      {
                        color: 'blue',
                        children: (
                          <>
                            <Text strong>Kısmen Karşılandı</Text>
                            <br />
                            <Text type="secondary" className="text-xs">
                              {reservation.fulfilledQuantity} adet karşılandı
                            </Text>
                          </>
                        ),
                      },
                    ]
                  : []),
                ...(reservation.status === 'Fulfilled'
                  ? [
                      {
                        color: 'green',
                        children: (
                          <>
                            <Text strong>Tamamen Karşılandı</Text>
                          </>
                        ),
                      },
                    ]
                  : []),
                ...(reservation.status === 'Cancelled'
                  ? [
                      {
                        color: 'red',
                        children: (
                          <>
                            <Text strong>İptal Edildi</Text>
                          </>
                        ),
                      },
                    ]
                  : []),
                ...(reservation.status === 'Expired'
                  ? [
                      {
                        color: 'red',
                        children: (
                          <>
                            <Text strong>Süresi Doldu</Text>
                            <br />
                            <Text type="secondary" className="text-xs">
                              {dayjs(reservation.expirationDate).format('DD/MM/YYYY')}
                            </Text>
                          </>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Fulfill Modal */}
      <Modal
        title="Rezervasyonu Karşıla"
        open={fulfillModalVisible}
        onOk={handleFulfill}
        onCancel={() => {
          setFulfillModalVisible(false);
          setFulfillQuantity(0);
        }}
        confirmLoading={fulfillReservation.isPending}
        okText="Karşıla"
        cancelText="İptal"
      >
        <div className="py-4">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between mb-2">
              <Text type="secondary">Toplam Miktar:</Text>
              <Text strong>{reservation.quantity}</Text>
            </div>
            <div className="flex justify-between mb-2">
              <Text type="secondary">Karşılanan:</Text>
              <Text strong>{reservation.fulfilledQuantity}</Text>
            </div>
            <div className="flex justify-between">
              <Text type="secondary">Kalan:</Text>
              <Text strong className="text-orange-500">{reservation.remainingQuantity}</Text>
            </div>
          </div>

          <Text className="block mb-2">Karşılanacak Miktar:</Text>
          <InputNumber
            value={fulfillQuantity}
            onChange={(val) => setFulfillQuantity(val || 0)}
            min={1}
            max={reservation.remainingQuantity}
            style={{ width: '100%' }}
            size="large"
          />
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title="Rezervasyonu İptal Et"
        open={cancelModalVisible}
        onOk={handleCancel}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelReason('');
        }}
        confirmLoading={cancelReservation.isPending}
        okText="İptal Et"
        okButtonProps={{ danger: true }}
        cancelText="Vazgeç"
      >
        <div className="py-4">
          <Text className="block mb-2">İptal Nedeni (opsiyonel):</Text>
          <Input.TextArea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="İptal nedenini belirtin..."
          />
        </div>
      </Modal>

      {/* Extend Modal */}
      <Modal
        title="Rezervasyon Süresini Uzat"
        open={extendModalVisible}
        onOk={handleExtend}
        onCancel={() => {
          setExtendModalVisible(false);
          setExtendDate(null);
        }}
        confirmLoading={extendReservation.isPending}
        okText="Uzat"
        cancelText="İptal"
      >
        <div className="py-4">
          <Text className="block mb-2">Yeni Son Geçerlilik Tarihi:</Text>
          <DatePicker
            value={extendDate}
            onChange={setExtendDate}
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            disabledDate={(current) => current && current < dayjs().endOf('day')}
          />
        </div>
      </Modal>
    </div>
  );
}
