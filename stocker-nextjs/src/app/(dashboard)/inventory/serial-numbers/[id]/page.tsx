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
  Alert,
  Input,
  Form,
  InputNumber,
  Divider,
  Timeline,
} from 'antd';
import {
  ArrowLeftOutlined,
  BarcodeOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import {
  useSerialNumber,
  useReceiveSerialNumber,
  useReserveSerialNumber,
  useSellSerialNumber,
  useMarkSerialNumberDefective,
  useScrapSerialNumber,
} from '@/lib/api/hooks/useInventory';
import { SerialNumberStatus } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

const statusConfig: Record<SerialNumberStatus, { color: string; label: string; icon: React.ReactNode }> = {
  [SerialNumberStatus.Available]: { color: 'blue', label: 'Kullanılabilir', icon: <CheckCircleOutlined /> },
  [SerialNumberStatus.InStock]: { color: 'green', label: 'Stokta', icon: <CheckCircleOutlined /> },
  [SerialNumberStatus.Reserved]: { color: 'orange', label: 'Rezerve', icon: <ShoppingCartOutlined /> },
  [SerialNumberStatus.Sold]: { color: 'purple', label: 'Satıldı', icon: <ShoppingCartOutlined /> },
  [SerialNumberStatus.Returned]: { color: 'cyan', label: 'İade Edildi', icon: <CheckCircleOutlined /> },
  [SerialNumberStatus.Defective]: { color: 'red', label: 'Arızalı', icon: <WarningOutlined /> },
  [SerialNumberStatus.InRepair]: { color: 'gold', label: 'Tamirde', icon: <WarningOutlined /> },
  [SerialNumberStatus.Scrapped]: { color: 'default', label: 'Hurda', icon: <WarningOutlined /> },
  [SerialNumberStatus.Lost]: { color: 'default', label: 'Kayıp', icon: <WarningOutlined /> },
  [SerialNumberStatus.OnLoan]: { color: 'lime', label: 'Ödünç Verildi', icon: <CheckCircleOutlined /> },
  [SerialNumberStatus.InTransit]: { color: 'geekblue', label: 'Transfer Halinde', icon: <WarningOutlined /> },
};

export default function SerialNumberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serialId = Number(params.id);

  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [defectiveModalOpen, setDefectiveModalOpen] = useState(false);
  const [sellForm] = Form.useForm();
  const [reserveForm] = Form.useForm();
  const [defectiveForm] = Form.useForm();

  const { data: serialNumber, isLoading } = useSerialNumber(serialId);
  const receiveSerialNumber = useReceiveSerialNumber();
  const reserveSerialNumber = useReserveSerialNumber();
  const sellSerialNumber = useSellSerialNumber();
  const markDefective = useMarkSerialNumberDefective();
  const scrapSerialNumber = useScrapSerialNumber();

  const handleReceive = async () => {
    try {
      await receiveSerialNumber.mutateAsync({ id: serialId });
    } catch {
      // Error handled
    }
  };

  const handleReserve = async () => {
    try {
      const values = await reserveForm.validateFields();
      await reserveSerialNumber.mutateAsync({
        id: serialId,
        request: { salesOrderId: values.salesOrderId },
      });
      setReserveModalOpen(false);
      reserveForm.resetFields();
    } catch {
      // Error handled
    }
  };

  const handleSell = async () => {
    try {
      const values = await sellForm.validateFields();
      await sellSerialNumber.mutateAsync({
        id: serialId,
        request: {
          customerId: values.customerId,
          salesOrderId: values.salesOrderId,
          warrantyMonths: values.warrantyMonths,
        },
      });
      setSellModalOpen(false);
      sellForm.resetFields();
    } catch {
      // Error handled
    }
  };

  const handleMarkDefective = async () => {
    try {
      const values = await defectiveForm.validateFields();
      await markDefective.mutateAsync({
        id: serialId,
        request: { reason: values.reason },
      });
      setDefectiveModalOpen(false);
      defectiveForm.resetFields();
    } catch {
      // Error handled
    }
  };

  const handleScrap = async () => {
    try {
      await scrapSerialNumber.mutateAsync({ id: serialId, request: { reason: 'Kullanılamaz durumda' } });
    } catch {
      // Error handled
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!serialNumber) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Seri numarası bulunamadı" />
      </div>
    );
  }

  const statusInfo = statusConfig[serialNumber.status];
  const canReceive = serialNumber.status === SerialNumberStatus.Available;
  const canReserve = serialNumber.status === SerialNumberStatus.InStock;
  const canSell = serialNumber.status === SerialNumberStatus.InStock || serialNumber.status === SerialNumberStatus.Reserved;
  const canMarkDefective = [SerialNumberStatus.InStock, SerialNumberStatus.Reserved, SerialNumberStatus.Returned].includes(serialNumber.status as SerialNumberStatus);
  const canScrap = serialNumber.status === SerialNumberStatus.Defective;

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
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
              >
                <BarcodeOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">{serialNumber.serial}</h1>
                  <Tag color={statusInfo.color} icon={statusInfo.icon}>
                    {statusInfo.label}
                  </Tag>
                  {serialNumber.isUnderWarranty && (
                    <Tag color="green" icon={<SafetyCertificateOutlined />}>
                      Garantili
                    </Tag>
                  )}
                </div>
                <p className="text-sm text-gray-500 m-0">
                  {serialNumber.productName} ({serialNumber.productCode})
                </p>
              </div>
            </div>
          </div>
          <Space>
            {canReceive && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleReceive}
                loading={receiveSerialNumber.isPending}
              >
                Teslim Al
              </Button>
            )}
            {canReserve && (
              <Button onClick={() => setReserveModalOpen(true)}>Rezerve Et</Button>
            )}
            {canSell && (
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={() => setSellModalOpen(true)}
                style={{ background: '#10b981', borderColor: '#10b981' }}
              >
                Sat
              </Button>
            )}
            {canMarkDefective && (
              <Button danger onClick={() => setDefectiveModalOpen(true)}>
                Arızalı İşaretle
              </Button>
            )}
            {canScrap && (
              <Button danger onClick={handleScrap} loading={scrapSerialNumber.isPending}>
                Hurda Olarak İşaretle
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* Warranty Alert */}
      {serialNumber.isUnderWarranty && serialNumber.remainingWarrantyDays !== undefined && (
        <Alert
          message={`Garanti Süresi: ${serialNumber.remainingWarrantyDays} gün kaldı`}
          description={
            serialNumber.warrantyEndDate
              ? `Garanti bitiş tarihi: ${dayjs(serialNumber.warrantyEndDate).format('DD/MM/YYYY')}`
              : undefined
          }
          type={serialNumber.remainingWarrantyDays <= 30 ? 'warning' : 'info'}
          showIcon
          icon={<SafetyCertificateOutlined />}
          className="mb-6"
        />
      )}

      {/* Stats */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Durum"
              value={statusInfo.label}
              valueStyle={{ color: statusInfo.color === 'green' ? '#10b981' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Garanti"
              value={serialNumber.isUnderWarranty ? 'Aktif' : 'Yok'}
              valueStyle={{ color: serialNumber.isUnderWarranty ? '#10b981' : '#6b7280' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Kalan Garanti"
              value={serialNumber.remainingWarrantyDays ?? '-'}
              suffix={serialNumber.remainingWarrantyDays ? 'gün' : ''}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Depo"
              value={serialNumber.warehouseName || '-'}
            />
          </Card>
        </Col>
      </Row>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <Card title="Seri Numarası Bilgileri" className="mb-6">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Seri No">{serialNumber.serial}</Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusInfo.color} icon={statusInfo.icon}>
                  {statusInfo.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ürün">{serialNumber.productName}</Descriptions.Item>
              <Descriptions.Item label="Ürün Kodu">{serialNumber.productCode}</Descriptions.Item>
              <Descriptions.Item label="Tedarikçi Seri No">
                {serialNumber.supplierSerial || <Text type="secondary">-</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Parti/Lot No">
                {serialNumber.batchNumber || <Text type="secondary">-</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Notlar" span={2}>
                {serialNumber.notes || <Text type="secondary">-</Text>}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Location */}
          <Card title="Konum Bilgileri" className="mb-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <EnvironmentOutlined style={{ fontSize: 32, color: '#3b82f6' }} />
              <div>
                <Text type="secondary" className="block text-xs">
                  Depo / Lokasyon
                </Text>
                <div className="font-medium">
                  {serialNumber.warehouseName || 'Belirtilmedi'}
                </div>
                {serialNumber.locationName && (
                  <Text type="secondary">{serialNumber.locationName}</Text>
                )}
              </div>
            </div>
          </Card>

          {/* Sales Info */}
          {(serialNumber.customerId || serialNumber.salesOrderId) && (
            <Card title="Satış Bilgileri">
              <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                <Descriptions.Item label="Müşteri ID">
                  {serialNumber.customerId || <Text type="secondary">-</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Sipariş No">
                  {serialNumber.salesOrderId || <Text type="secondary">-</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Satış Tarihi">
                  {serialNumber.soldDate
                    ? dayjs(serialNumber.soldDate).format('DD/MM/YYYY')
                    : <Text type="secondary">-</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Satın Alma Siparişi">
                  {serialNumber.purchaseOrderId || <Text type="secondary">-</Text>}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
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
                    {serialNumber.manufacturedDate
                      ? dayjs(serialNumber.manufacturedDate).format('DD/MM/YYYY')
                      : '-'}
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarOutlined style={{ color: '#6b7280', fontSize: 18 }} />
                <div>
                  <Text type="secondary" className="block text-xs">
                    Teslim Tarihi
                  </Text>
                  <Text>
                    {serialNumber.receivedDate
                      ? dayjs(serialNumber.receivedDate).format('DD/MM/YYYY')
                      : '-'}
                  </Text>
                </div>
              </div>

              <Divider className="my-2" />

              <div className="flex items-center gap-3">
                <CalendarOutlined style={{ color: '#6b7280', fontSize: 18 }} />
                <div>
                  <Text type="secondary" className="block text-xs">
                    Oluşturulma Tarihi
                  </Text>
                  <Text>
                    {dayjs(serialNumber.createdAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </div>
              </div>
            </div>
          </Card>

          {/* Warranty */}
          <Card title="Garanti Bilgileri" className="mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Text>Garanti Durumu</Text>
                <Tag color={serialNumber.isUnderWarranty ? 'green' : 'default'}>
                  {serialNumber.isUnderWarranty ? 'Aktif' : 'Yok'}
                </Tag>
              </div>

              {serialNumber.warrantyStartDate && (
                <div className="flex justify-between items-center">
                  <Text type="secondary">Başlangıç</Text>
                  <Text>{dayjs(serialNumber.warrantyStartDate).format('DD/MM/YYYY')}</Text>
                </div>
              )}

              {serialNumber.warrantyEndDate && (
                <div className="flex justify-between items-center">
                  <Text type="secondary">Bitiş</Text>
                  <Text>{dayjs(serialNumber.warrantyEndDate).format('DD/MM/YYYY')}</Text>
                </div>
              )}

              {serialNumber.remainingWarrantyDays !== undefined && serialNumber.remainingWarrantyDays > 0 && (
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Text type="secondary" className="block text-xs">
                    Kalan Süre
                  </Text>
                  <div className="text-2xl font-bold text-green-600">
                    {serialNumber.remainingWarrantyDays} gün
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Sell Modal */}
      <Modal
        title="Seri Numarasını Sat"
        open={sellModalOpen}
        onCancel={() => {
          setSellModalOpen(false);
          sellForm.resetFields();
        }}
        onOk={handleSell}
        okText="Sat"
        cancelText="İptal"
        okButtonProps={{ loading: sellSerialNumber.isPending }}
      >
        <Form form={sellForm} layout="vertical">
          <Form.Item
            name="customerId"
            label="Müşteri ID"
            rules={[{ required: true, message: 'Müşteri ID gerekli' }]}
          >
            <Input placeholder="Müşteri ID" />
          </Form.Item>

          <Form.Item
            name="salesOrderId"
            label="Sipariş No"
            rules={[{ required: true, message: 'Sipariş numarası gerekli' }]}
          >
            <Input placeholder="Sipariş numarası" />
          </Form.Item>

          <Form.Item name="warrantyMonths" label="Garanti Süresi (Ay)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="12" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reserve Modal */}
      <Modal
        title="Seri Numarasını Rezerve Et"
        open={reserveModalOpen}
        onCancel={() => {
          setReserveModalOpen(false);
          reserveForm.resetFields();
        }}
        onOk={handleReserve}
        okText="Rezerve Et"
        cancelText="İptal"
        okButtonProps={{ loading: reserveSerialNumber.isPending }}
      >
        <Form form={reserveForm} layout="vertical">
          <Form.Item
            name="salesOrderId"
            label="Sipariş No"
            rules={[{ required: true, message: 'Sipariş numarası gerekli' }]}
          >
            <Input placeholder="Sipariş numarası" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Defective Modal */}
      <Modal
        title="Arızalı Olarak İşaretle"
        open={defectiveModalOpen}
        onCancel={() => {
          setDefectiveModalOpen(false);
          defectiveForm.resetFields();
        }}
        onOk={handleMarkDefective}
        okText="İşaretle"
        cancelText="İptal"
        okButtonProps={{ danger: true, loading: markDefective.isPending }}
      >
        <Form form={defectiveForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Arıza Nedeni"
            rules={[{ required: true, message: 'Arıza nedeni gerekli' }]}
          >
            <TextArea rows={3} placeholder="Arıza nedenini açıklayın..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
