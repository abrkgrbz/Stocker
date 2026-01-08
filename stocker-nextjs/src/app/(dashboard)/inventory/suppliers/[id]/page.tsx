'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  Tag,
  Spin,
  Empty,
  Table,
  Modal,
  message,
  Dropdown,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  StarIcon,
  PlusIcon,
  CubeIcon,
  TruckIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ArchiveBoxIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useSupplier, useRemoveSupplierProduct } from '@/lib/api/hooks/useInventory';
import { SupplierProductDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = Number(params.id);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SupplierProductDto | null>(null);

  const { data: supplier, isLoading, refetch } = useSupplier(supplierId);
  const removeProductMutation = useRemoveSupplierProduct();

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await removeProductMutation.mutateAsync({
        supplierId: String(supplierId),
        productId: String(selectedProduct.productId),
      });
      message.success('Ürün tedarikçiden kaldırıldı');
      setDeleteModalVisible(false);
      setSelectedProduct(null);
      refetch();
    } catch {
      message.error('Ürün kaldırılırken hata oluştu');
    }
  };

  const productColumns: ColumnsType<SupplierProductDto> = [
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
            <CubeIcon className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <div className="font-medium text-slate-900">{record.productName}</div>
            <div className="text-xs text-slate-500">{record.productCode}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tedarikçi Ürün Kodu',
      dataIndex: 'supplierProductCode',
      key: 'supplierProductCode',
      render: (code) => code || <span className="text-slate-400">-</span>,
    },
    {
      title: 'Birim Maliyet',
      key: 'unitPrice',
      align: 'right',
      render: (_, record) => (
        <span className="font-medium text-slate-900">
          {record.unitPrice.toLocaleString('tr-TR', {
            style: 'currency',
            currency: record.currency || 'TRY',
          })}
        </span>
      ),
    },
    {
      title: 'Min. Sipariş',
      dataIndex: 'minOrderQuantity',
      key: 'minOrderQuantity',
      align: 'right',
      render: (qty) => <span className="text-slate-700">{qty} adet</span>,
    },
    {
      title: 'Teslim Süresi',
      dataIndex: 'leadTimeDays',
      key: 'leadTimeDays',
      align: 'right',
      render: (days) => <span className="text-slate-700">{days} gün</span>,
    },
    {
      title: 'Durum',
      key: 'status',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.isPreferred && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-white">
              <StarIcon className="w-3 h-3" />
              Tercih Edilen
            </span>
          )}
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <PencilIcon className="w-4 h-4" />,
                onClick: () => router.push(`/inventory/suppliers/${supplierId}/products/${record.id}/edit`),
              },
              {
                key: 'delete',
                label: 'Kaldır',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                onClick: () => {
                  setSelectedProduct(record);
                  setDeleteModalVisible(true);
                },
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" size="small" icon={<EllipsisVerticalIcon className="w-4 h-4" />} />
        </Dropdown>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Tedarikçi bulunamadı" />
      </div>
    );
  }

  const address = [supplier.street, supplier.city, supplier.state, supplier.country, supplier.postalCode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4"
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
            <Button type="text" icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()}>
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <BuildingStorefrontIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{supplier.name}</h1>
                  {supplier.isActive && (
                    <Tag color="gold" icon={<StarIcon className="w-3 h-3" />}>
                      Tercih Edilen
                    </Tag>
                  )}
                  <Tag
                    icon={supplier.isActive ? <CheckCircleIcon className="w-3 h-3" /> : <ClockIcon className="w-3 h-3" />}
                    color={supplier.isActive ? 'success' : 'default'}
                  >
                    {supplier.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">Kod: {supplier.code}</p>
              </div>
            </div>
          </div>
          <Button
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => router.push(`/inventory/suppliers/${supplierId}/edit`)}
          >
            Düzenle
          </Button>
        </div>
      </div>

      {/* KPI Cards - 4 columns */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CalendarDaysIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Ödeme Vadesi</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">{supplier.paymentTerm || 0}</span>
            <span className="text-sm text-slate-500">gün</span>
          </div>
        </div>

        <div className="col-span-3 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Kredi Limiti</span>
          </div>
          <span className="text-3xl font-bold text-slate-900">
            {supplier.creditLimit?.toLocaleString('tr-TR', {
              style: 'currency',
              currency: 'TRY',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }) || '₺0'}
          </span>
        </div>

        <div className="col-span-3 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <ArchiveBoxIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-slate-500">Ürün Sayısı</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">{supplier.productCount || 0}</span>
            <span className="text-sm text-slate-500">ürün</span>
          </div>
        </div>

        <div className="col-span-3 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <TruckIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Ort. Teslim Süresi</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">
              {supplier.products && supplier.products.length > 0
                ? Math.round(supplier.products.reduce((sum, p) => sum + p.leadTimeDays, 0) / supplier.products.length)
                : 0}
            </span>
            <span className="text-sm text-slate-500">gün</span>
          </div>
        </div>
      </div>

      {/* Main Content - Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - 8 cols */}
        <div className="col-span-8 space-y-6">
          {/* Supplier Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Tedarikçi Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Tedarikçi Kodu</div>
                <div className="font-medium text-slate-900">{supplier.code}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Tedarikçi Adı</div>
                <div className="font-medium text-slate-900">{supplier.name}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Vergi Dairesi</div>
                <div className="font-medium text-slate-900">{supplier.taxOffice || '-'}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Vergi No</div>
                <div className="font-medium text-slate-900">{supplier.taxNumber || '-'}</div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">İletişim Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              {supplier.contactPerson && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">İletişim Kişisi</div>
                    <div className="font-medium text-slate-900">{supplier.contactPerson}</div>
                  </div>
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <EnvelopeIcon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">E-posta</div>
                    <a href={`mailto:${supplier.email}`} className="font-medium text-slate-900 hover:text-blue-600">
                      {supplier.email}
                    </a>
                  </div>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <PhoneIcon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Telefon</div>
                    <a href={`tel:${supplier.phone}`} className="font-medium text-slate-900 hover:text-blue-600">
                      {supplier.phone}
                    </a>
                  </div>
                </div>
              )}
              {supplier.contactPhone && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <PhoneIcon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">İletişim Telefonu</div>
                    <a href={`tel:${supplier.contactPhone}`} className="font-medium text-slate-900 hover:text-blue-600">
                      {supplier.contactPhone}
                    </a>
                  </div>
                </div>
              )}
              {supplier.website && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <GlobeAltIcon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Web Sitesi</div>
                    <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-900 hover:text-blue-600">
                      {supplier.website}
                    </a>
                  </div>
                </div>
              )}
              {!supplier.contactPerson && !supplier.email && !supplier.phone && !supplier.contactPhone && !supplier.website && (
                <div className="col-span-2 text-center py-8 text-slate-400">
                  İletişim bilgisi bulunmuyor
                </div>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Tedarikçi Ürünleri</h3>
              <Button
                type="primary"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={() => router.push(`/inventory/suppliers/${supplierId}/products/new`)}
              >
                Ürün Ekle
              </Button>
            </div>
            {supplier.products && supplier.products.length > 0 ? (
              <Table
                dataSource={supplier.products}
                columns={productColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Henüz ürün eklenmemiş"
              >
                <Button
                  type="primary"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => router.push(`/inventory/suppliers/${supplierId}/products/new`)}
                >
                  İlk Ürünü Ekle
                </Button>
              </Empty>
            )}
          </div>
        </div>

        {/* Right Column - 4 cols */}
        <div className="col-span-4 space-y-6">
          {/* Business Terms */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Ticari Koşullar</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-500">Ödeme Vadesi</span>
                <span className="font-medium text-slate-900">{supplier.paymentTerm || 0} gün</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-500">Kredi Limiti</span>
                <span className="font-medium text-slate-900">
                  {supplier.creditLimit?.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }) || '₺0,00'}
                </span>
              </div>
            </div>
          </div>

          {/* Address */}
          {address && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Adres</h3>
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="text-sm text-slate-700">
                  {supplier.street && <div>{supplier.street}</div>}
                  <div>{[supplier.city, supplier.state].filter(Boolean).join(', ')}</div>
                  <div>{[supplier.postalCode, supplier.country].filter(Boolean).join(' ')}</div>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Kayıt Bilgileri</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Oluşturulma</span>
                <span className="text-sm text-slate-700">{dayjs(supplier.createdAt).format('DD/MM/YYYY HH:mm')}</span>
              </div>
              {supplier.updatedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Güncelleme</span>
                  <span className="text-sm text-slate-700">{dayjs(supplier.updatedAt).format('DD/MM/YYYY HH:mm')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Ürünü Kaldır"
        open={deleteModalVisible}
        onOk={handleDeleteProduct}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedProduct(null);
        }}
        okText="Kaldır"
        cancelText="İptal"
        okButtonProps={{ danger: true, loading: removeProductMutation.isPending }}
      >
        <p>
          <strong>{selectedProduct?.productName}</strong> ürününü bu tedarikçiden kaldırmak istediğinize emin misiniz?
        </p>
      </Modal>
    </div>
  );
}
