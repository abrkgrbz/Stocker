'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Space,
  Tag,
  Modal,
  Empty,
  Table,
  InputNumber,
  AutoComplete,
  Form,
  Switch,
  Progress,
} from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ListBulletIcon,
  PencilIcon,
  PlusIcon,
  ReceiptPercentIcon,
  TagIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  usePriceList,
  useDeletePriceList,
  useActivatePriceList,
  useDeactivatePriceList,
  useProducts,
  useAddPriceListItem,
  useUpdatePriceListItem,
} from '@/lib/api/hooks/useInventory';
import type { PriceListItemDto, CreatePriceListItemDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const currencySymbols: Record<string, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
};

type ValidityStatus = 'pending' | 'valid' | 'expired' | 'unknown';

const validityConfig: Record<
  ValidityStatus,
  { label: string; bgColor: string; textColor: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Beklemede',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: <CalendarIcon className="w-4 h-4" />,
  },
  valid: {
    label: 'Geçerli',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
  expired: {
    label: 'Süresi Doldu',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: <XCircleIcon className="w-4 h-4" />,
  },
  unknown: {
    label: 'Bilinmiyor',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    icon: <CalendarIcon className="w-4 h-4" />,
  },
};

export default function PriceListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const priceListId = Number(params.id);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceListItemDto | null>(null);
  const [newItemForm] = Form.useForm();

  const { data: priceList, isLoading } = usePriceList(priceListId);
  const { data: products = [] } = useProducts();
  const deletePriceList = useDeletePriceList();
  const activatePriceList = useActivatePriceList();
  const deactivatePriceList = useDeactivatePriceList();
  const addPriceListItem = useAddPriceListItem();
  const updatePriceListItem = useUpdatePriceListItem();

  const handleDelete = async () => {
    try {
      await deletePriceList.mutateAsync(priceListId);
      router.push('/inventory/price-lists');
    } catch {
      // Error handled by mutation
    }
  };

  const handleToggleActive = async () => {
    if (!priceList) return;
    try {
      if (priceList.isActive) {
        await deactivatePriceList.mutateAsync(priceListId);
      } else {
        await activatePriceList.mutateAsync(priceListId);
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleAddItem = async () => {
    try {
      const values = await newItemForm.validateFields();

      const data: CreatePriceListItemDto = {
        productId: values.productId,
        price: values.price,
        minQuantity: values.minQuantity,
        maxQuantity: values.maxQuantity,
        discountPercentage: values.discountPercentage,
      };

      await addPriceListItem.mutateAsync({ priceListId, data });
      setAddItemModalOpen(false);
      newItemForm.resetFields();
    } catch {
      // Validation error
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      const values = await newItemForm.validateFields();

      const data: CreatePriceListItemDto = {
        productId: editingItem.productId,
        price: values.price,
        minQuantity: values.minQuantity,
        maxQuantity: values.maxQuantity,
        discountPercentage: values.discountPercentage,
      };

      await updatePriceListItem.mutateAsync({
        priceListId,
        itemId: editingItem.id,
        data,
      });
      setEditingItem(null);
      newItemForm.resetFields();
    } catch {
      // Validation error
    }
  };

  const openEditModal = (item: PriceListItemDto) => {
    setEditingItem(item);
    newItemForm.setFieldsValue({
      productId: item.productId,
      price: item.price,
      minQuantity: item.minQuantity,
      maxQuantity: item.maxQuantity,
      discountPercentage: item.discountPercentage,
    });
  };

  const getValidityStatus = (): ValidityStatus => {
    if (!priceList) return 'unknown';

    const now = dayjs();
    const validFrom = priceList.validFrom ? dayjs(priceList.validFrom) : null;
    const validTo = priceList.validTo ? dayjs(priceList.validTo) : null;

    if (validFrom && now.isBefore(validFrom)) {
      return 'pending';
    }
    if (validTo && now.isAfter(validTo)) {
      return 'expired';
    }
    return 'valid';
  };

  const itemColumns: ColumnsType<PriceListItemDto> = [
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.productName}</div>
          <span className="text-xs text-slate-500">{record.productCode}</span>
        </div>
      ),
    },
    {
      title: 'Fiyat',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price, record) => (
        <span className="font-semibold text-slate-900">
          {price.toLocaleString('tr-TR', {
            style: 'currency',
            currency: record.currency || priceList?.currency || 'TRY',
          })}
        </span>
      ),
    },
    {
      title: 'Miktar Aralığı',
      key: 'quantity',
      width: 150,
      render: (_, record) => {
        if (!record.minQuantity && !record.maxQuantity) {
          return <span className="text-slate-400">-</span>;
        }
        return (
          <span className="text-slate-700">
            {record.minQuantity || 1} - {record.maxQuantity || '∞'}
          </span>
        );
      },
    },
    {
      title: 'İndirim',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      width: 100,
      render: (discount) =>
        discount ? (
          <Tag className="border-0 bg-emerald-50 text-emerald-700">%{discount}</Tag>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag
          className={`border-0 ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
        >
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeIcon className="w-4 h-4" />}
            onClick={() => router.push(`/inventory/products/${record.productId}`)}
            className="text-slate-500 hover:text-blue-600"
            title="Ürün Detayı"
          />
          <Button
            type="text"
            size="small"
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => openEditModal(record)}
            className="text-slate-500 hover:text-slate-700"
          />
        </Space>
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

  if (!priceList) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Fiyat listesi bulunamadı" />
      </div>
    );
  }

  const validityStatus = getValidityStatus();
  const validity = validityConfig[validityStatus];
  const currencySymbol = currencySymbols[priceList.currency] || priceList.currency;
  const totalItems = priceList.items?.length || 0;
  const activeItems = priceList.items?.filter((i) => i.isActive).length || 0;
  const avgPrice =
    totalItems > 0 ? priceList.items.reduce((sum, i) => sum + i.price, 0) / totalItems : 0;
  const activePercent = totalItems > 0 ? Math.round((activeItems / totalItems) * 100) : 0;

  // Get products not already in the price list
  const availableProducts = products.filter(
    (p) => !priceList.items?.some((i) => i.productId === p.id)
  );

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
              <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{priceList.name}</h1>
                  <Tag
                    icon={priceList.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    className={`border-0 ${
                      priceList.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {priceList.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                  <Tag icon={validity.icon} className={`border-0 ${validity.bgColor} ${validity.textColor}`}>
                    {validity.label}
                  </Tag>
                  {priceList.isDefault && (
                    <Tag className="border-0 bg-blue-50 text-blue-700">Varsayılan</Tag>
                  )}
                </div>
                <p className="text-sm text-slate-500 m-0">
                  Kod: {priceList.code} | Para Birimi: {currencySymbol} {priceList.currency}
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={priceList.isActive ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
              onClick={handleToggleActive}
              loading={activatePriceList.isPending || deactivatePriceList.isPending}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              {priceList.isActive ? 'Devre Dışı Bırak' : 'Aktifleştir'}
            </Button>
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/price-lists/${priceListId}/edit`)}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              Düzenle
            </Button>
            <Button
              danger
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={() => setDeleteModalOpen(true)}
            >
              Sil
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
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Para Birimi
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{currencySymbol}</span>
                <span className="text-sm text-slate-400">{priceList.currency}</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <ListBulletIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Toplam Kalem
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{totalItems}</span>
                <span className="text-sm text-emerald-600">{activeItems} aktif</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TagIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ort. Fiyat
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-emerald-600">
                  {avgPrice.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-sm text-slate-400">{currencySymbol}</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Cog6ToothIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Öncelik
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-indigo-600">{priceList.priority}</span>
                <span className="text-sm text-slate-400">seviye</span>
              </div>
            </div>
          </div>

          {/* List Info Section */}
          <div className="col-span-12 md:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Liste Bilgileri
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Kod</p>
                  <p className="text-sm font-medium text-slate-900">{priceList.code}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ad</p>
                  <p className="text-sm font-medium text-slate-900">{priceList.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Para Birimi</p>
                  <p className="text-sm font-medium text-slate-900">
                    {currencySymbol} {priceList.currency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Öncelik Seviyesi</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-sm font-medium">
                    {priceList.priority}
                  </span>
                </div>
                {priceList.description && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-1">Açıklama</p>
                    <p className="text-sm text-slate-600">{priceList.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Items Ratio Section */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Aktif Kalem Oranı
              </p>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <Progress
                    type="circle"
                    percent={activePercent}
                    status={activePercent === 100 ? 'success' : 'normal'}
                    size={100}
                    format={(percent) => (
                      <span className="text-lg font-bold text-slate-900">{percent}%</span>
                    )}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Toplam</span>
                    <span className="text-sm font-medium text-slate-900">{totalItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Aktif</span>
                    <span className="text-sm font-medium text-emerald-600">{activeItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Pasif</span>
                    <span className="text-sm font-medium text-slate-400">
                      {totalItems - activeItems}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Validity Section */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Geçerlilik
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400">Başlangıç Tarihi</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {priceList.validFrom
                      ? dayjs(priceList.validFrom).format('DD/MM/YYYY')
                      : 'Belirtilmedi'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400">Bitiş Tarihi</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {priceList.validTo
                      ? dayjs(priceList.validTo).format('DD/MM/YYYY')
                      : 'Belirtilmedi'}
                  </p>
                </div>
              </div>
              <div className="text-center pt-2 border-t border-slate-100">
                <Tag
                  icon={validity.icon}
                  className={`border-0 ${validity.bgColor} ${validity.textColor} text-base px-4 py-1`}
                >
                  {validity.label}
                </Tag>
              </div>
            </div>
          </div>

          {/* Discounts & Settings Section */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                İndirimler & Ayarlar
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ReceiptPercentIcon className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-slate-400">Genel İndirim</span>
                  </div>
                  <p className="text-xl font-bold text-emerald-600">
                    {priceList.globalDiscountPercentage
                      ? `%${priceList.globalDiscountPercentage}`
                      : '-'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ReceiptPercentIcon className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-slate-400">Kar Marjı</span>
                  </div>
                  <p className="text-xl font-bold text-red-600">
                    {priceList.globalMarkupPercentage
                      ? `%${priceList.globalMarkupPercentage}`
                      : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">Varsayılan Liste</span>
                  <Switch checked={priceList.isDefault} disabled size="small" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">Aktif</span>
                  <Switch checked={priceList.isActive} disabled size="small" />
                </div>
              </div>
            </div>
          </div>

          {/* Price Items Table */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Fiyat Kalemleri ({totalItems})
                </p>
                <Button
                  type="primary"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => setAddItemModalOpen(true)}
                  size="small"
                  style={{ background: '#1e293b', borderColor: '#1e293b' }}
                  disabled={availableProducts.length === 0}
                >
                  Kalem Ekle
                </Button>
              </div>
              <Table
                columns={itemColumns}
                dataSource={priceList.items || []}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
                }}
                size="small"
                locale={{ emptyText: 'Henüz fiyat kalemi eklenmedi' }}
                className="border border-slate-200 rounded-lg overflow-hidden"
              />
            </div>
          </div>

          {/* Timestamps Section */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Kayıt Bilgileri
              </p>
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">Oluşturulma:</span>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(priceList.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
                {priceList.updatedAt && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Güncelleme:</span>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(priceList.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        title="Fiyat Listesini Sil"
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onOk={handleDelete}
        okText="Sil"
        cancelText="İptal"
        okButtonProps={{ danger: true, loading: deletePriceList.isPending }}
      >
        <p>
          <strong>{priceList.name}</strong> fiyat listesini silmek istediğinize emin misiniz?
        </p>
        <p className="text-slate-500 text-sm">Bu işlem geri alınamaz.</p>
      </Modal>

      {/* Add/Edit Item Modal */}
      <Modal
        title={editingItem ? 'Fiyat Kalemini Düzenle' : 'Yeni Fiyat Kalemi'}
        open={addItemModalOpen || !!editingItem}
        onCancel={() => {
          setAddItemModalOpen(false);
          setEditingItem(null);
          newItemForm.resetFields();
        }}
        onOk={editingItem ? handleUpdateItem : handleAddItem}
        okText={editingItem ? 'Güncelle' : 'Ekle'}
        cancelText="İptal"
        okButtonProps={{
          loading: addPriceListItem.isPending || updatePriceListItem.isPending,
          style: { background: '#1e293b', borderColor: '#1e293b' },
        }}
      >
        <Form form={newItemForm} layout="vertical">
          {!editingItem && (
            <Form.Item
              name="productId"
              label="Ürün"
              rules={[{ required: true, message: 'Ürün seçiniz' }]}
            >
              <AutoComplete
                placeholder="Ürün ara..."
                options={availableProducts.map((p) => ({
                  value: p.id,
                  label: `${p.code} - ${p.name}`,
                }))}
                filterOption={(inputValue, option) =>
                  option?.label?.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                }
              />
            </Form.Item>
          )}

          {editingItem && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-400">Seçilen Ürün</span>
              <div className="font-medium text-slate-900">{editingItem.productName}</div>
              <span className="text-xs text-slate-500">{editingItem.productCode}</span>
            </div>
          )}

          <Form.Item
            name="price"
            label={`Fiyat (${priceList.currency})`}
            rules={[{ required: true, message: 'Fiyat gerekli' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              prefix={currencySymbol}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="minQuantity" label="Min. Miktar">
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
            <Form.Item name="maxQuantity" label="Max. Miktar">
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </div>

          <Form.Item name="discountPercentage" label="İndirim Oranı (%)">
            <InputNumber style={{ width: '100%' }} min={0} max={100} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
