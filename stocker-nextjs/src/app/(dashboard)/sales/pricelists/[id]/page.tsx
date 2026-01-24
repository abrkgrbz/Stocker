'use client';

/**
 * Price List Detail Page
 * Fiyat listesi detay sayfasi - Monochrome Design System
 */

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  TagIcon,
  UserGroupIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Table, Spin, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { usePriceList, useActivatePriceList, useDeactivatePriceList } from '@/features/sales';
import type { PriceListItemDto, PriceListCustomerDto } from '@/features/sales';

dayjs.locale('tr');

const typeLabels: Record<string, string> = {
  Standard: 'Standart',
  Promotional: 'Promosyon',
  Contract: 'Sozlesme',
  Wholesale: 'Toptan',
  Retail: 'Perakende',
};

export default function PriceListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: priceList, isLoading } = usePriceList(id);
  const activateMutation = useActivatePriceList();
  const deactivateMutation = useDeactivatePriceList();

  const handleToggleActive = () => {
    if (priceList?.isActive) {
      deactivateMutation.mutate(id);
    } else {
      activateMutation.mutate(id);
    }
  };

  if (isLoading) {
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
          <h2 className="text-lg font-semibold text-slate-900">Fiyat listesi bulunamadi</h2>
          <Link href="/sales/pricelists" className="text-sm text-slate-500 hover:text-slate-700 mt-2 inline-block">
            Listeye don
          </Link>
        </div>
      </div>
    );
  }

  const itemColumns: ColumnsType<PriceListItemDto> = [
    {
      title: 'Urun Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 140,
      render: (code: string) => (
        <span className="font-mono text-sm text-slate-700">{code}</span>
      ),
    },
    {
      title: 'Urun Adi',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string) => (
        <span className="text-sm font-medium text-slate-900">{name}</span>
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      align: 'right',
      render: (price: number, record) => (
        <span className="text-sm font-semibold text-slate-900">
          {price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.unitPriceCurrency}
        </span>
      ),
    },
    {
      title: 'Min. Miktar',
      dataIndex: 'minimumQuantity',
      key: 'minimumQuantity',
      width: 100,
      align: 'center',
      render: (qty: number | undefined) => (
        <span className="text-sm text-slate-600">{qty || '-'}</span>
      ),
    },
    {
      title: 'Indirim %',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      width: 100,
      align: 'center',
      render: (discount: number | undefined) => (
        discount ? (
          <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded">
            %{discount}
          </span>
        ) : <span className="text-slate-400">-</span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <span className={`w-2 h-2 rounded-full inline-block ${isActive ? 'bg-slate-900' : 'bg-slate-300'}`} />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/sales/pricelists"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{priceList.name}</h1>
                <p className="text-sm text-slate-500 font-mono">{priceList.code}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleActive}
              disabled={activateMutation.isPending || deactivateMutation.isPending}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                priceList.isActive
                  ? 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
                  : 'text-white bg-slate-900 hover:bg-slate-800 border-slate-900'
              }`}
            >
              {priceList.isActive ? 'Pasife Al' : 'Aktiflestirir'}
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors">
              <PencilIcon className="w-4 h-4" />
              Duzenle
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Genel Bilgiler
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Kod</p>
                  <p className="text-sm font-medium text-slate-900 font-mono">{priceList.code}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Ad</p>
                  <p className="text-sm font-medium text-slate-900">{priceList.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tip</p>
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                    {typeLabels[priceList.type] || priceList.type}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Para Birimi</p>
                  <p className="text-sm font-medium text-slate-900">{priceList.currencyCode}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">KDV Dahil</p>
                  <p className="text-sm font-medium text-slate-900">{priceList.isTaxIncluded ? 'Evet' : 'Hayir'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Oncelik</p>
                  <p className="text-sm font-medium text-slate-900">{priceList.priority}</p>
                </div>
                {priceList.description && (
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-xs text-slate-500 mb-1">Aciklama</p>
                    <p className="text-sm text-slate-700">{priceList.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Urunler</h3>
                  <p className="text-xs text-slate-500">{priceList.items?.length || 0} urun kayitli</p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  <PlusIcon className="w-3.5 h-3.5" />
                  Urun Ekle
                </button>
              </div>
              <Table
                className="enterprise-table"
                columns={itemColumns}
                dataSource={priceList.items || []}
                rowKey="id"
                pagination={{ pageSize: 10, showTotal: (total) => `${total} urun` }}
                size="small"
              />
            </div>
          </div>

          {/* Right column - 1/3 */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Durum</h3>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg ${
                    priceList.isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {priceList.isActive ? (
                    <><CheckCircleIcon className="w-4 h-4" /> Aktif</>
                  ) : (
                    <><XCircleIcon className="w-4 h-4" /> Pasif</>
                  )}
                </span>
              </div>
            </div>

            {/* Validity Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                Gecerlilik
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Baslangic</p>
                  <p className="text-sm font-medium text-slate-900">
                    {dayjs(priceList.validFrom).format('DD MMMM YYYY')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Bitis</p>
                  <p className="text-sm font-medium text-slate-900">
                    {priceList.validTo
                      ? dayjs(priceList.validTo).format('DD MMMM YYYY')
                      : 'Suresiz'}
                  </p>
                </div>
                {priceList.validTo && dayjs(priceList.validTo).isBefore(dayjs()) && (
                  <div className="px-3 py-2 bg-slate-100 rounded-lg">
                    <p className="text-xs font-medium text-slate-600">Suresi dolmus</p>
                  </div>
                )}
              </div>
            </div>

            {/* Customers Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <UserGroupIcon className="w-4 h-4 text-slate-400" />
                  Atanan Musteriler
                </h3>
                <span className="text-xs text-slate-500">
                  {priceList.assignedCustomers?.length || 0}
                </span>
              </div>
              {priceList.assignedCustomers && priceList.assignedCustomers.length > 0 ? (
                <div className="space-y-2">
                  {priceList.assignedCustomers.map((customer: PriceListCustomerDto) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{customer.customerName}</p>
                        <p className="text-xs text-slate-500">
                          {dayjs(customer.validFrom).format('DD.MM.YYYY')}
                          {customer.validTo && ` - ${dayjs(customer.validTo).format('DD.MM.YYYY')}`}
                        </p>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${customer.isActive ? 'bg-slate-900' : 'bg-slate-300'}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">
                  Henuz musteri atanmadi
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
