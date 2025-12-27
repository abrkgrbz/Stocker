'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Form,
  Input,
  DatePicker,
  Table,
  Spin,
  Switch,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  CurrencyDollarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  usePriceList,
  useUpdatePriceList,
} from '@/lib/api/hooks/usePurchase';
import type { PriceListStatus } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusConfig: Record<PriceListStatus, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Taslak' },
  PendingApproval: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Onay Bekliyor' },
  Approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Onaylandı' },
  Active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aktif' },
  Inactive: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Pasif' },
  Expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Süresi Doldu' },
  Superseded: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Yenilendi' },
  Rejected: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Reddedildi' },
};

export default function EditPriceListPage() {
  const params = useParams();
  const router = useRouter();
  const priceListId = params.id as string;
  const [form] = Form.useForm();

  const { data: priceList, isLoading: priceListLoading } = usePriceList(priceListId);
  const updatePriceList = useUpdatePriceList();

  useEffect(() => {
    if (priceList) {
      form.setFieldsValue({
        name: priceList.name,
        description: priceList.description,
        effectiveTo: priceList.effectiveTo ? dayjs(priceList.effectiveTo) : null,
        isDefault: priceList.isDefault,
        notes: priceList.notes,
      });
    }
  }, [priceList, form]);

  if (priceListLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!priceList) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <CurrencyDollarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Fiyat Listesi Bulunamadı</h3>
          <p className="text-sm text-slate-500 mb-4">Aradığınız fiyat listesi mevcut değil.</p>
          <button
            onClick={() => router.push('/purchase/price-lists')}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Fiyat Listelerine Dön
          </button>
        </div>
      </div>
    );
  }

  const canEdit = priceList.status === 'Draft' || priceList.status === 'Inactive';

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <CurrencyDollarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Düzenleme Yapılamaz</h3>
          <p className="text-sm text-slate-500 mb-4">Sadece taslak veya pasif listeler düzenlenebilir.</p>
          <button
            onClick={() => router.push(`/purchase/price-lists/${priceListId}`)}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Listeye Dön
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async (values: any) => {
    try {
      await updatePriceList.mutateAsync({
        id: priceListId,
        data: {
          name: values.name,
          description: values.description,
          effectiveTo: values.effectiveTo?.toISOString(),
          isDefault: values.isDefault,
          notes: values.notes,
        },
      });
      message.success('Fiyat listesi başarıyla güncellendi');
      router.push(`/purchase/price-lists/${priceListId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/price-lists/${priceListId}`);
  };

  const isLoading = updatePriceList.isPending;
  const status = statusConfig[priceList.status as PriceListStatus] || statusConfig.Draft;

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: any) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{name || 'Belirtilmemiş'}</div>
          {record.productCode && (
            <div className="text-xs text-slate-500">{record.productCode}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: 140,
      align: 'right' as const,
      render: (price: number) => (
        <span className="text-sm font-medium text-slate-900">
          {(price || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {priceList.currency}
        </span>
      ),
    },
    {
      title: 'Min. Miktar',
      dataIndex: 'minQuantity',
      key: 'minQuantity',
      width: 100,
      align: 'center' as const,
      render: (qty: number) => <span className="text-sm text-slate-600">{qty}</span>,
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      render: (text: string) => <span className="text-sm text-slate-600">{text}</span>,
    },
    {
      title: 'İndirim %',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      width: 100,
      align: 'center' as const,
      render: (discount: number) =>
        discount ? (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
            %{discount}
          </span>
        ) : (
          <span className="text-sm text-slate-400">-</span>
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">Fiyat Listesini Düzenle</h1>
                  <p className="text-sm text-slate-500">{priceList.code}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-4 h-4" />
                İptal
              </button>
              <button
                onClick={() => form.submit()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* Read-Only Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Liste Bilgileri (Salt Okunur)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Liste Kodu</span>
                <p className="text-sm font-medium text-slate-900 mt-1">{priceList.code}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Durum</span>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tedarikçi</span>
                <p className="text-sm font-medium text-slate-900 mt-1">{priceList.supplierName || '-'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Para Birimi</span>
                <p className="text-sm font-medium text-slate-900 mt-1">{priceList.currency}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Başlangıç Tarihi</span>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {priceList.effectiveFrom
                    ? dayjs(priceList.effectiveFrom).format('DD.MM.YYYY')
                    : '-'}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ürün Sayısı</span>
                <p className="text-sm font-medium text-slate-900 mt-1">{priceList.items?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Düzenlenebilir Alanlar</h3>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label={<span className="text-sm font-medium text-slate-700">Liste Adı</span>}
                rules={[{ required: true, message: 'Ad zorunludur' }]}
              >
                <Input placeholder="Fiyat listesi adı" />
              </Form.Item>

              <Form.Item
                name="effectiveTo"
                label={<span className="text-sm font-medium text-slate-700">Bitiş Tarihi</span>}
              >
                <DatePicker className="w-full" format="DD.MM.YYYY" placeholder="Tarih" />
              </Form.Item>
            </div>

            <Form.Item
              name="description"
              label={<span className="text-sm font-medium text-slate-700">Açıklama</span>}
            >
              <TextArea rows={2} placeholder="Liste açıklaması..." />
            </Form.Item>

            <Form.Item
              name="isDefault"
              label={<span className="text-sm font-medium text-slate-700">Varsayılan Liste</span>}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="notes"
              label={<span className="text-sm font-medium text-slate-700">Notlar</span>}
            >
              <TextArea rows={2} placeholder="Ek notlar..." />
            </Form.Item>
          </div>

          {/* Items (Read-Only) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-medium text-slate-900">Fiyat Kalemleri (Salt Okunur)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Fiyat kalemlerini düzenlemek için lütfen listeyi silin ve yeni bir liste oluşturun.
              </p>
            </div>
            <Table
              columns={itemColumns}
              dataSource={priceList.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: 'Henüz ürün eklenmedi' }}
              scroll={{ x: 600 }}
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wide"
            />
            {(priceList.items?.length || 0) > 0 && (
              <div className="px-6 py-3 border-t border-slate-100 text-right text-sm text-slate-500">
                Toplam: {priceList.items?.length} ürün
              </div>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}
