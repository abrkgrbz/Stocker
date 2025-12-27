'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Space,
  Tag,
  Spin,
  Empty,
  Table,
  Dropdown,
} from 'antd';
import {
  ArrowLeftIcon,
  BuildingLibraryIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  ReceiptPercentIcon,
  ShoppingCartIcon,
  StarIcon,
  StopCircleIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useSupplier,
  useActivateSupplier,
  useDeactivateSupplier,
  useBlockSupplier,
  useUnblockSupplier,
} from '@/lib/api/hooks/usePurchase';
import type { SupplierStatus, SupplierType } from '@/lib/api/services/purchase.types';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const statusConfig: Record<
  SupplierStatus,
  { label: string; bgColor: string; textColor: string; icon: React.ReactNode }
> = {
  Active: {
    label: 'Aktif',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
  Inactive: {
    label: 'Pasif',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-500',
    icon: <XCircleIcon className="w-4 h-4" />,
  },
  Pending: {
    label: 'Onay Bekliyor',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: <CalendarIcon className="w-4 h-4" />,
  },
  Blacklisted: {
    label: 'Bloklu',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: <StopCircleIcon className="w-4 h-4" />,
  },
  OnHold: {
    label: 'Beklemede',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    icon: <CalendarIcon className="w-4 h-4" />,
  },
};

const typeLabels: Record<SupplierType, string> = {
  Manufacturer: 'Üretici',
  Wholesaler: 'Toptancı',
  Distributor: 'Distribütör',
  Importer: 'İthalatçı',
  Retailer: 'Perakendeci',
  ServiceProvider: 'Hizmet Sağlayıcı',
  Other: 'Diğer',
};

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;

  const { data: supplier, isLoading } = useSupplier(supplierId);
  const activateSupplier = useActivateSupplier();
  const deactivateSupplier = useDeactivateSupplier();
  const blockSupplier = useBlockSupplier();
  const unblockSupplier = useUnblockSupplier();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <Empty description="Tedarikçi bulunamadı" />
        <Button onClick={() => router.push('/purchase/suppliers')} className="mt-4">
          Tedarikçilere Dön
        </Button>
      </div>
    );
  }

  const status = statusConfig[supplier.status as SupplierStatus] || statusConfig.Inactive;
  const primaryContact = supplier.contacts?.find((c) => c.isPrimary) || supplier.contacts?.[0];

  const actionMenuItems = [
    supplier.status !== 'Active' && {
      key: 'activate',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Aktifleştir',
      onClick: () => activateSupplier.mutate(supplierId),
    },
    supplier.status === 'Active' && {
      key: 'deactivate',
      icon: <StopCircleIcon className="w-4 h-4" />,
      label: 'Devre Dışı Bırak',
      onClick: () => deactivateSupplier.mutate(supplierId),
    },
    supplier.status !== 'Blacklisted' && {
      key: 'block',
      icon: <StopCircleIcon className="w-4 h-4" />,
      label: 'Blokla',
      danger: true,
      onClick: () => blockSupplier.mutate({ id: supplierId, reason: 'Manual block' }),
    },
    supplier.status === 'Blacklisted' && {
      key: 'unblock',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Bloğu Kaldır',
      onClick: () => unblockSupplier.mutate(supplierId),
    },
  ].filter(Boolean) as MenuProps['items'];

  const fullAddress = [
    supplier.address,
    supplier.district,
    supplier.city,
    supplier.postalCode,
    supplier.country,
  ]
    .filter(Boolean)
    .join(', ');

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
              onClick={() => router.push('/purchase/suppliers')}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                {supplier.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{supplier.name}</h1>
                  <Tag
                    icon={status.icon}
                    className={`border-0 ${status.bgColor} ${status.textColor}`}
                  >
                    {status.label}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {supplier.code} • {typeLabels[supplier.type as SupplierType]}
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
              <Button
                icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
                className="border-slate-200 text-slate-700 hover:border-slate-300"
              >
                İşlemler
              </Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/purchase/suppliers/${supplierId}/edit`)}
              style={{ background: '#1e293b', borderColor: '#1e293b' }}
            >
              Düzenle
            </Button>
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* KPI Cards Row */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-4 h-4 text-blue-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kredi Limiti
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-slate-900">
                  {(supplier.creditLimit || 0).toLocaleString('tr-TR')}
                </span>
                <span className="text-sm text-slate-400">{supplier.currency || 'TRY'}</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    (supplier.currentBalance || 0) > 0 ? 'bg-amber-100' : 'bg-emerald-100'
                  }`}
                >
                  <BuildingLibraryIcon className="w-4 h-4" className={`text-lg ${
                      (supplier.currentBalance || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Güncel Bakiye
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span
                  className={`text-2xl font-bold ${
                    (supplier.currentBalance || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {(supplier.currentBalance || 0).toLocaleString('tr-TR')}
                </span>
                <span className="text-sm text-slate-400">{supplier.currency || 'TRY'}</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <ReceiptPercentIcon className="w-4 h-4 text-emerald-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  İndirim Oranı
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-emerald-600">
                  %{supplier.discountRate || 0}
                </span>
                <span className="text-sm text-slate-400">indirim</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <StarIcon className="w-4 h-4 text-amber-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Puan</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-amber-600">
                  {supplier.rating?.toFixed(1) || '-'}
                </span>
                <span className="text-sm text-slate-400">/5</span>
              </div>
            </div>
          </div>

          {/* Company Info Section */}
          <div className="col-span-12 md:col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <BuildingStorefrontIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Firma Bilgileri
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Tedarikçi Adı</p>
                  <p className="text-sm font-medium text-slate-900">{supplier.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Kod</p>
                  <p className="text-sm font-medium text-slate-900">{supplier.code}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Tip</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-sm font-medium">
                    {typeLabels[supplier.type as SupplierType]}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag
                    icon={status.icon}
                    className={`border-0 ${status.bgColor} ${status.textColor}`}
                  >
                    {status.label}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Vergi No</p>
                  <p className="text-sm font-medium text-slate-900">{supplier.taxNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Vergi Dairesi</p>
                  <p className="text-sm font-medium text-slate-900">{supplier.taxOffice || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="col-span-12 md:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <PhoneIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  İletişim Bilgileri
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <PhoneIcon className="w-4 h-4 text-slate-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Telefon</p>
                    <p className="text-sm font-medium text-slate-900">{supplier.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <EnvelopeIcon className="w-4 h-4 text-slate-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">E-posta</p>
                    <p className="text-sm font-medium text-slate-900">{supplier.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <GlobeAltIcon className="w-4 h-4 text-slate-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Web Sitesi</p>
                    {supplier.website ? (
                      <a
                        href={supplier.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {supplier.website}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-400">-</p>
                    )}
                  </div>
                </div>
                {supplier.fax && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <DocumentTextIcon className="w-4 h-4 text-slate-500 text-sm" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Faks</p>
                      <p className="text-sm font-medium text-slate-900">{supplier.fax}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adres</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 mb-1">Tam Adres</p>
                  <p className="text-sm font-medium text-slate-900">{supplier.address || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">İlçe</p>
                  <p className="text-sm font-medium text-slate-900">{supplier.district || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Şehir</p>
                  <p className="text-sm font-medium text-slate-900">{supplier.city || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Posta Kodu</p>
                  <p className="text-sm font-medium text-slate-900">{supplier.postalCode || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ülke</p>
                  <p className="text-sm font-medium text-slate-900">{supplier.country || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Info Section */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BuildingLibraryIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Finansal Bilgiler
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ödeme Vadesi</p>
                  <p className="text-sm font-medium text-slate-900">
                    {supplier.paymentTerms || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Para Birimi</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-sm font-medium">
                    {supplier.currency || 'TRY'}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 mb-1">Banka</p>
                  <p className="text-sm font-medium text-slate-900">{supplier.bankName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Hesap No</p>
                  <p className="text-sm font-medium text-slate-900">
                    {supplier.bankAccountNumber || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">IBAN</p>
                  <p className="text-sm font-medium text-slate-900 text-xs">{supplier.iban || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {supplier.notes && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Notlar
                  </p>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{supplier.notes}</p>
              </div>
            </div>
          )}

          {/* Contacts Table */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    İletişim Kişileri ({supplier.contacts?.length || 0})
                  </p>
                </div>
              </div>
              {supplier.contacts && supplier.contacts.length > 0 ? (
                <Table
                  dataSource={supplier.contacts}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  className="border border-slate-200 rounded-lg overflow-hidden"
                  columns={[
                    {
                      title: 'Ad Soyad',
                      dataIndex: 'name',
                      key: 'name',
                      render: (name, record: { isPrimary?: boolean }) => (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{name}</span>
                          {record.isPrimary && (
                            <Tag className="border-0 bg-blue-50 text-blue-700">Birincil</Tag>
                          )}
                        </div>
                      ),
                    },
                    {
                      title: 'Ünvan',
                      dataIndex: 'title',
                      key: 'title',
                      render: (title) => (
                        <span className="text-slate-600">{title || '-'}</span>
                      ),
                    },
                    {
                      title: 'E-posta',
                      dataIndex: 'email',
                      key: 'email',
                      render: (email) => (
                        <span className="text-slate-600">{email || '-'}</span>
                      ),
                    },
                    {
                      title: 'Telefon',
                      dataIndex: 'phone',
                      key: 'phone',
                      render: (phone) => (
                        <span className="text-slate-600">{phone || '-'}</span>
                      ),
                    },
                  ]}
                />
              ) : (
                <div className="text-center py-8">
                  <Empty description="İletişim kişisi bulunmuyor" />
                </div>
              )}
            </div>
          </div>

          {/* Orders Quick Action */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                    <ShoppingCartIcon className="w-4 h-4 text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Siparişler</p>
                    <p className="text-xs text-slate-500">Bu tedarikçiye ait tüm siparişleri görüntüle</p>
                  </div>
                </div>
                <Button
                  type="primary"
                  onClick={() => router.push(`/purchase/orders?supplierId=${supplierId}`)}
                  style={{ background: '#1e293b', borderColor: '#1e293b' }}
                >
                  Siparişleri Gör
                </Button>
              </div>
            </div>
          </div>

          {/* Timestamps Section */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Kayıt Bilgileri
              </p>
              <div className="flex gap-8">
                {supplier.createdAt && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Oluşturulma:</span>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(supplier.createdAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
                {supplier.updatedAt && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Güncelleme:</span>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(supplier.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
