'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Space,
  Alert,
  Tag,
  Table,
  Modal,
  Form,
  InputNumber,
  Input,
  message,
} from 'antd';
import { Spinner } from '@/components/primitives';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftIcon,
  PencilIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CubeIcon,
  TruckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  useConsignmentStock,
  useRecordConsignmentSale,
  useRecordConsignmentReturn,
  useRecordConsignmentDamage,
  useRecordConsignmentPayment,
  useSuspendConsignmentStock,
  useReactivateConsignmentStock,
  useCloseConsignmentStock,
} from '@/lib/api/hooks/useInventory';
import type { ConsignmentStockMovementDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusConfig: Record<string, { color: string; label: string; bg: string; text: string }> = {
  Active: { color: 'success', label: 'Aktif', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Suspended: { color: 'warning', label: 'Askıda', bg: 'bg-amber-100', text: 'text-amber-700' },
  Depleted: { color: 'default', label: 'Tükenmiş', bg: 'bg-slate-100', text: 'text-slate-600' },
  Returned: { color: 'processing', label: 'İade Edildi', bg: 'bg-blue-100', text: 'text-blue-700' },
  Closed: { color: 'default', label: 'Kapalı', bg: 'bg-slate-100', text: 'text-slate-600' },
};

const movementTypeLabels: Record<string, { label: string; color: string }> = {
  Receipt: { label: 'Alım', color: 'blue' },
  Sale: { label: 'Satış', color: 'green' },
  Return: { label: 'İade', color: 'orange' },
  SupplierReturn: { label: 'Tedarikçiye İade', color: 'purple' },
  Damage: { label: 'Hasar', color: 'red' },
  Adjustment: { label: 'Düzeltme', color: 'default' },
  Payment: { label: 'Ödeme', color: 'cyan' },
};

type ModalType = 'sale' | 'return' | 'damage' | 'payment' | null;

export default function ConsignmentStockDetailPage() {
  const router = useRouter();
  const params = useParams();
  const consignmentId = Number(params.id);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [form] = Form.useForm();

  const { data: consignment, isLoading, error } = useConsignmentStock(consignmentId);
  const recordSale = useRecordConsignmentSale();
  const recordReturn = useRecordConsignmentReturn();
  const recordDamage = useRecordConsignmentDamage();
  const recordPayment = useRecordConsignmentPayment();
  const suspendConsignment = useSuspendConsignmentStock();
  const reactivateConsignment = useReactivateConsignmentStock();
  const closeConsignment = useCloseConsignmentStock();

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();

      switch (modalType) {
        case 'sale':
          await recordSale.mutateAsync({ id: consignmentId, data: values });
          break;
        case 'return':
          await recordReturn.mutateAsync({ id: consignmentId, data: values });
          break;
        case 'damage':
          await recordDamage.mutateAsync({ id: consignmentId, data: values });
          break;
        case 'payment':
          await recordPayment.mutateAsync({ id: consignmentId, data: values });
          break;
      }

      setModalType(null);
      form.resetFields();
    } catch {
      // Validation or API error
    }
  };

  const handleSuspend = () => {
    suspendConsignment.mutate(consignmentId);
  };

  const handleReactivate = () => {
    reactivateConsignment.mutate(consignmentId);
  };

  const handleClose = () => {
    Modal.confirm({
      title: 'Anlaşmayı Kapat',
      icon: <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />,
      content: 'Bu konsinye anlaşmasını kapatmak istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Kapat',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => closeConsignment.mutate(consignmentId),
    });
  };

  const movementColumns: ColumnsType<ConsignmentStockMovementDto> = [
    {
      title: 'Tarih',
      dataIndex: 'movementDate',
      key: 'movementDate',
      render: (date) => (
        <span className="text-sm text-slate-600">
          {dayjs(date).format('DD/MM/YYYY HH:mm')}
        </span>
      ),
    },
    {
      title: 'İşlem Tipi',
      dataIndex: 'movementType',
      key: 'movementType',
      render: (type: string) => {
        const config = movementTypeLabels[type] || { label: type, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      render: (qty) => (
        <span className={`text-sm font-medium ${qty >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {qty >= 0 ? '+' : ''}{qty?.toLocaleString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      render: (price, record) => (
        <span className="text-sm text-slate-600">
          {price?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'Toplam',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (amount, record) => (
        <span className="text-sm font-semibold text-slate-900">
          {amount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => (
        <span className="text-sm text-slate-500">{notes || '-'}</span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !consignment) {
    return (
      <div className="p-8">
        <Alert
          message="Konsinye Stok Bulunamadı"
          description="İstenen konsinye stok kaydı bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/consignment-stocks')}>
              Listeye Dön
            </Button>
          }
        />
      </div>
    );
  }

  const statusInfo = statusConfig[consignment.status] || statusConfig.Active;
  const isActive = consignment.status === 'Active';
  const isSuspended = consignment.status === 'Suspended';
  const isClosed = consignment.status === 'Closed';

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/inventory/consignment-stocks')}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <BuildingStorefrontIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {consignment.consignmentNumber}
                  </h1>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {consignment.supplierName} • {consignment.productName}
                </p>
              </div>
            </div>
          </div>
          <Space>
            {isActive && (
              <>
                <Button onClick={() => setModalType('sale')}>Satış Kaydet</Button>
                <Button onClick={() => setModalType('return')}>İade Kaydet</Button>
                <Button onClick={() => setModalType('damage')}>Hasar Kaydet</Button>
                <Button onClick={() => setModalType('payment')}>Ödeme Kaydet</Button>
                <Button onClick={handleSuspend}>Askıya Al</Button>
              </>
            )}
            {isSuspended && (
              <Button onClick={handleReactivate}>Yeniden Aktif Et</Button>
            )}
            {!isClosed && (
              <>
                <Link href={`/inventory/consignment-stocks/${consignmentId}/edit`}>
                  <Button icon={<PencilIcon className="w-4 h-4" />}>Düzenle</Button>
                </Link>
                <Button danger onClick={handleClose}>Anlaşmayı Kapat</Button>
              </>
            )}
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        {/* İki Kolonlu Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sol Kolon - Ana Bilgiler (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Genel Bilgiler Kartı */}
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900">Genel Bilgiler</h2>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">Tedarikçi</dt>
                    <dd className="text-sm font-medium text-slate-900">{consignment.supplierName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">Ürün</dt>
                    <dd className="text-sm font-medium text-slate-900">
                      {consignment.productName}
                      {consignment.productSku && (
                        <span className="text-slate-500 font-normal ml-2">({consignment.productSku})</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">Depo</dt>
                    <dd className="text-sm text-slate-900">{consignment.warehouseName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">Lokasyon</dt>
                    <dd className="text-sm text-slate-900">{consignment.locationName || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">Komisyon Oranı</dt>
                    <dd className="text-sm text-slate-900">
                      {consignment.commissionRate ? `%${consignment.commissionRate}` : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">Minimum Satış Fiyatı</dt>
                    <dd className="text-sm text-slate-900">
                      {consignment.minimumSalePrice
                        ? `${consignment.minimumSalePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${consignment.currency}`
                        : '-'
                      }
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Açıklama & Notlar */}
            {(consignment.description || consignment.notes) && (
              <div className="bg-white border border-slate-200 rounded-xl">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-medium text-slate-900">Açıklama & Notlar</h2>
                </div>
                <div className="p-6 space-y-4">
                  {consignment.description && (
                    <div>
                      <dt className="text-xs text-slate-500 mb-1">Açıklama</dt>
                      <dd className="text-sm text-slate-700">{consignment.description}</dd>
                    </div>
                  )}
                  {consignment.notes && (
                    <div>
                      <dt className="text-xs text-slate-500 mb-1">Notlar</dt>
                      <dd className="text-sm text-slate-700">{consignment.notes}</dd>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sağ Kolon - Meta Bilgiler (1/3) */}
          <div className="space-y-6">
            {/* Stok Durumu */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
                <CubeIcon className="w-4 h-4 text-slate-500" />
                Stok Durumu
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Mevcut Miktar</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {consignment.currentQuantity?.toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Alınan Miktar</span>
                  <span className="text-sm text-slate-900">
                    {consignment.receivedQuantity?.toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <span className="text-sm text-slate-600">Satılan Miktar</span>
                  <span className="text-sm font-medium text-emerald-600">
                    {consignment.soldQuantity?.toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm text-slate-600">İade Edilen</span>
                  <span className="text-sm font-medium text-amber-600">
                    {consignment.returnedQuantity?.toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm text-slate-600">Hasarlı</span>
                  <span className="text-sm font-medium text-red-600">
                    {consignment.damagedQuantity?.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Finansal Durum */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
                <CurrencyDollarIcon className="w-4 h-4 text-slate-500" />
                Finansal Durum
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Birim Fiyat</span>
                  <span className="text-sm font-medium text-slate-900">
                    {consignment.unitPrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {consignment.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <span className="text-sm text-slate-600">Toplam Satış</span>
                  <span className="text-sm font-medium text-emerald-600">
                    {consignment.totalSalesAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {consignment.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-slate-600">Toplam Ödeme</span>
                  <span className="text-sm font-medium text-blue-600">
                    {consignment.totalPaymentAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {consignment.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm text-slate-600">Bakiye</span>
                  <span className="text-sm font-semibold text-amber-700">
                    {consignment.balance?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {consignment.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Tarih Bilgileri */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-500" />
                Tarihler
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Başlangıç</p>
                    <p className="text-sm text-slate-900">
                      {consignment.startDate ? dayjs(consignment.startDate).format('DD/MM/YYYY') : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Bitiş</p>
                    <p className="text-sm text-slate-900">
                      {consignment.endDate ? dayjs(consignment.endDate).format('DD/MM/YYYY') : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Oluşturulma</p>
                    <p className="text-sm text-slate-900">
                      {dayjs(consignment.createdAt).format('DD/MM/YYYY HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hareket Geçmişi */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-900 flex items-center gap-2">
              <TruckIcon className="w-4 h-4 text-slate-500" />
              Hareket Geçmişi
            </h2>
            <span className="text-xs text-slate-500">
              {consignment.movements?.length || 0} kayıt
            </span>
          </div>
          <Table
            columns={movementColumns}
            dataSource={consignment.movements || []}
            rowKey="id"
            pagination={false}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
          />
        </div>
      </div>

      {/* Modals */}
      <Modal
        title={
          modalType === 'sale' ? 'Satış Kaydet' :
          modalType === 'return' ? 'İade Kaydet' :
          modalType === 'damage' ? 'Hasar Kaydet' :
          'Ödeme Kaydet'
        }
        open={!!modalType}
        onCancel={() => {
          setModalType(null);
          form.resetFields();
        }}
        onOk={handleModalSubmit}
        confirmLoading={
          recordSale.isPending ||
          recordReturn.isPending ||
          recordDamage.isPending ||
          recordPayment.isPending
        }
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="quantity"
            label="Miktar"
            rules={[{ required: true, message: 'Miktar zorunludur' }]}
          >
            <InputNumber
              min={0}
              max={modalType !== 'payment' ? consignment.currentQuantity : undefined}
              style={{ width: '100%' }}
              placeholder="Miktar girin"
            />
          </Form.Item>

          {modalType === 'sale' && (
            <Form.Item
              name="salePrice"
              label="Satış Fiyatı"
              rules={[{ required: true, message: 'Satış fiyatı zorunludur' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="Satış fiyatı girin"
              />
            </Form.Item>
          )}

          {modalType === 'payment' && (
            <Form.Item
              name="amount"
              label="Ödeme Tutarı"
              rules={[{ required: true, message: 'Tutar zorunludur' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="Ödeme tutarı girin"
              />
            </Form.Item>
          )}

          {(modalType === 'return' || modalType === 'damage') && (
            <Form.Item
              name="reason"
              label="Sebep"
              rules={[{ required: true, message: 'Sebep zorunludur' }]}
            >
              <TextArea rows={3} placeholder="Sebep açıklayın..." />
            </Form.Item>
          )}

          <Form.Item name="notes" label="Notlar">
            <TextArea rows={2} placeholder="Ek notlar..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
