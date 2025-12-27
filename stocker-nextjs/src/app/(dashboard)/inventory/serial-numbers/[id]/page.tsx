'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Space,
  Tag,
  Spin,
  Modal,
  Empty,
  Alert,
  Input,
  Form,
  InputNumber,
} from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
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

const { TextArea } = Input;

const statusConfig: Record<
  SerialNumberStatus,
  { label: string; bgColor: string; textColor: string; icon: React.ReactNode }
> = {
  [SerialNumberStatus.Available]: {
    label: 'Kullanılabilir',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
  [SerialNumberStatus.InStock]: {
    label: 'Stokta',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
  [SerialNumberStatus.Reserved]: {
    label: 'Rezerve',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: <ShoppingCartIcon className="w-4 h-4" />,
  },
  [SerialNumberStatus.Sold]: {
    label: 'Satıldı',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    icon: <ShoppingCartIcon className="w-4 h-4" />,
  },
  [SerialNumberStatus.Returned]: {
    label: 'İade Edildi',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
  [SerialNumberStatus.Defective]: {
    label: 'Arızalı',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: <ExclamationTriangleIcon className="w-4 h-4" />,
  },
  [SerialNumberStatus.InRepair]: {
    label: 'Tamirde',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    icon: <ExclamationTriangleIcon className="w-4 h-4" />,
  },
  [SerialNumberStatus.Scrapped]: {
    label: 'Hurda',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    icon: <ExclamationTriangleIcon className="w-4 h-4" />,
  },
  [SerialNumberStatus.Lost]: {
    label: 'Kayıp',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    icon: <ExclamationTriangleIcon className="w-4 h-4" />,
  },
  [SerialNumberStatus.OnLoan]: {
    label: 'Ödünç Verildi',
    bgColor: 'bg-lime-50',
    textColor: 'text-lime-700',
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
  [SerialNumberStatus.InTransit]: {
    label: 'Transfer Halinde',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    icon: <ExclamationTriangleIcon className="w-4 h-4" />,
  },
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
      await scrapSerialNumber.mutateAsync({
        id: serialId,
        request: { reason: 'Kullanılamaz durumda' },
      });
    } catch {
      // Error handled
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!serialNumber) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Seri numarası bulunamadı" />
      </div>
    );
  }

  const statusInfo = statusConfig[serialNumber.status];
  const canReceive = serialNumber.status === SerialNumberStatus.Available;
  const canReserve = serialNumber.status === SerialNumberStatus.InStock;
  const canSell =
    serialNumber.status === SerialNumberStatus.InStock ||
    serialNumber.status === SerialNumberStatus.Reserved;
  const canMarkDefective = [
    SerialNumberStatus.InStock,
    SerialNumberStatus.Reserved,
    SerialNumberStatus.Returned,
  ].includes(serialNumber.status as SerialNumberStatus);
  const canScrap = serialNumber.status === SerialNumberStatus.Defective;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">
                <QrCodeIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{serialNumber.serial}</h1>
                  <Tag
                    icon={statusInfo.icon}
                    className={`border-0 ${statusInfo.bgColor} ${statusInfo.textColor}`}
                  >
                    {statusInfo.label}
                  </Tag>
                  {serialNumber.isUnderWarranty && (
                    <Tag
                      icon={<ShieldCheckIcon className="w-4 h-4" />}
                      className="border-0 bg-emerald-50 text-emerald-700"
                    >
                      Garantili
                    </Tag>
                  )}
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {serialNumber.productName} ({serialNumber.productCode})
                </p>
              </div>
            </div>
          </div>
          <Space>
            {canReceive && (
              <Button
                type="primary"
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleReceive}
                loading={receiveSerialNumber.isPending}
                style={{ background: '#1e293b', borderColor: '#1e293b' }}
              >
                Teslim Al
              </Button>
            )}
            {canReserve && (
              <Button
                onClick={() => setReserveModalOpen(true)}
                className="border-slate-200 text-slate-700 hover:border-slate-300"
              >
                Rezerve Et
              </Button>
            )}
            {canSell && (
              <Button
                type="primary"
                icon={<ShoppingCartIcon className="w-4 h-4" />}
                onClick={() => setSellModalOpen(true)}
                style={{ background: '#1e293b', borderColor: '#1e293b' }}
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
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
            icon={<ShieldCheckIcon className="w-4 h-4" />}
            className="mb-6"
          />
        )}

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* KPI Cards Row */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <QrCodeIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Durum</p>
              </div>
              <div className="flex items-end justify-between">
                <Tag
                  icon={statusInfo.icon}
                  className={`border-0 ${statusInfo.bgColor} ${statusInfo.textColor} text-base px-3 py-1`}
                >
                  {statusInfo.label}
                </Tag>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Garanti</p>
              </div>
              <div className="flex items-end justify-between">
                <span
                  className={`text-2xl font-bold ${serialNumber.isUnderWarranty ? 'text-emerald-600' : 'text-slate-400'}`}
                >
                  {serialNumber.isUnderWarranty ? 'Aktif' : 'Yok'}
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kalan Garanti
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-blue-600">
                  {serialNumber.remainingWarrantyDays ?? '-'}
                </span>
                {serialNumber.remainingWarrantyDays && (
                  <span className="text-sm text-slate-400">gün</span>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <MapPinIcon className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Depo</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-lg font-bold text-slate-900 truncate">
                  {serialNumber.warehouseName || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Serial Info Section */}
          <div className="col-span-12 md:col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Seri Numarası Bilgileri
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Seri No</p>
                  <p className="text-sm font-medium text-slate-900">{serialNumber.serial}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag
                    icon={statusInfo.icon}
                    className={`border-0 ${statusInfo.bgColor} ${statusInfo.textColor}`}
                  >
                    {statusInfo.label}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ürün</p>
                  <button
                    onClick={() => router.push(`/inventory/products/${serialNumber.productId}`)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {serialNumber.productName}
                  </button>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ürün Kodu</p>
                  <p className="text-sm font-medium text-slate-900">{serialNumber.productCode}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Tedarikçi Seri No</p>
                  <p className="text-sm font-medium text-slate-900">
                    {serialNumber.supplierSerial || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Parti/Lot No</p>
                  <p className="text-sm font-medium text-slate-900">
                    {serialNumber.batchNumber || '-'}
                  </p>
                </div>
                {serialNumber.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-1">Notlar</p>
                    <p className="text-sm text-slate-600">{serialNumber.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="col-span-12 md:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Konum Bilgileri
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <MapPinIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-1">Depo / Lokasyon</p>
                  <p className="text-lg font-medium text-slate-900">
                    {serialNumber.warehouseName || 'Belirtilmedi'}
                  </p>
                  {serialNumber.locationName && (
                    <p className="text-sm text-slate-500">{serialNumber.locationName}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Warranty Section */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Garanti Bilgileri
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Garanti Durumu</span>
                  <Tag
                    className={`border-0 ${serialNumber.isUnderWarranty ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {serialNumber.isUnderWarranty ? 'Aktif' : 'Yok'}
                  </Tag>
                </div>

                {serialNumber.warrantyStartDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Başlangıç</span>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(serialNumber.warrantyStartDate).format('DD/MM/YYYY')}
                    </span>
                  </div>
                )}

                {serialNumber.warrantyEndDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Bitiş</span>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(serialNumber.warrantyEndDate).format('DD/MM/YYYY')}
                    </span>
                  </div>
                )}

                {serialNumber.remainingWarrantyDays !== undefined &&
                  serialNumber.remainingWarrantyDays > 0 && (
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Kalan Süre</p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {serialNumber.remainingWarrantyDays} gün
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Dates Section */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Tarihler
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Üretim Tarihi</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {serialNumber.manufacturedDate
                      ? dayjs(serialNumber.manufacturedDate).format('DD/MM/YYYY')
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Teslim Tarihi</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {serialNumber.receivedDate
                      ? dayjs(serialNumber.receivedDate).format('DD/MM/YYYY')
                      : '-'}
                  </span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Oluşturulma</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(serialNumber.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Info Section */}
          {(serialNumber.customerId || serialNumber.salesOrderId) && (
            <div className="col-span-12 md:col-span-4">
              <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Satış Bilgileri
                </p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Müşteri ID</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {serialNumber.customerId || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Sipariş No</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {serialNumber.salesOrderId || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Satış Tarihi</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {serialNumber.soldDate
                        ? dayjs(serialNumber.soldDate).format('DD/MM/YYYY')
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ShoppingCartIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Satın Alma Siparişi</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {serialNumber.purchaseOrderId || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
