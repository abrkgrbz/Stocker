'use client';

/**
 * Price Lists Page
 * Manage pricing tiers linked to customer segments
 * Modern card-based UI with Tailwind CSS
 */

import React, { useState } from 'react';
import { Modal, message, Switch } from 'antd';
import {
  Plus,
  Tags,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  Check,
  X,
} from 'lucide-react';
import {
  PageContainer,
  ListPageHeader,
  Card,
  Badge,
  EmptyState,
} from '@/components/patterns';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

// Types
interface PriceList {
  id: string;
  name: string;
  description: string;
  code: string;
  currency: string;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  itemCount: number;
  linkedSegments: string[];
  createdAt: string;
}

// Mock data
const mockPriceLists: PriceList[] = [
  {
    id: '1',
    name: '2024 Toptan Fiyat Listesi',
    description: 'Toptan satış için özel fiyatlandırma',
    code: 'PL-2024-WHS',
    currency: 'TRY',
    isActive: true,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    itemCount: 1250,
    linkedSegments: ['Toptan Satış', 'VIP Müşteriler'],
    createdAt: '2023-12-15',
  },
  {
    id: '2',
    name: '2024 Perakende Listesi',
    description: 'Standart perakende fiyatları',
    code: 'PL-2024-RTL',
    currency: 'TRY',
    isActive: true,
    startDate: '2024-01-01',
    endDate: null,
    itemCount: 1250,
    linkedSegments: ['Perakende'],
    createdAt: '2023-12-15',
  },
  {
    id: '3',
    name: 'Kampanya Fiyat Listesi',
    description: 'Sezonluk indirimli fiyatlar',
    code: 'PL-2024-CMP',
    currency: 'TRY',
    isActive: false,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    itemCount: 450,
    linkedSegments: ['Yeni Müşteri'],
    createdAt: '2024-05-20',
  },
  {
    id: '4',
    name: 'B2B Partner Listesi',
    description: 'İş ortakları için özel fiyatlar',
    code: 'PL-2024-B2B',
    currency: 'USD',
    isActive: true,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    itemCount: 890,
    linkedSegments: ['VIP Müşteriler'],
    createdAt: '2024-01-10',
  },
  {
    id: '5',
    name: 'Yurtdışı Satış Listesi',
    description: 'İhracat fiyatları',
    code: 'PL-2024-EXP',
    currency: 'EUR',
    isActive: true,
    startDate: '2024-01-01',
    endDate: null,
    itemCount: 750,
    linkedSegments: [],
    createdAt: '2024-02-01',
  },
  {
    id: '6',
    name: '2023 Arşiv Listesi',
    description: 'Geçmiş yıl fiyatları',
    code: 'PL-2023-ARC',
    currency: 'TRY',
    isActive: false,
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    itemCount: 1100,
    linkedSegments: [],
    createdAt: '2022-12-20',
  },
];

export default function PriceListsPage() {
  const [priceLists, setPriceLists] = useState<PriceList[]>(mockPriceLists);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToggleActive = (id: string, currentActive: boolean) => {
    setPriceLists((prev) =>
      prev.map((pl) =>
        pl.id === id ? { ...pl, isActive: !currentActive } : pl
      )
    );
    message.success(
      currentActive ? 'Fiyat listesi pasifleştirildi' : 'Fiyat listesi aktifleştirildi'
    );
  };

  const handleDeleteClick = (id: string) => {
    Modal.confirm({
      title: 'Fiyat Listesini Sil',
      content: 'Bu fiyat listesini silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => {
        setPriceLists((prev) => prev.filter((pl) => pl.id !== id));
        message.success('Fiyat listesi silindi');
      },
    });
    setOpenDropdown(null);
  };

  const handleViewItems = (id: string) => {
    message.info(`Fiyat listesi detaylarına yönlendiriliyor... (ID: ${id})`);
    // In real implementation: router.push(`/sales/pricelists/${id}`)
  };

  const formatDateRange = (startDate: string, endDate: string | null) => {
    const start = dayjs(startDate).format('DD MMM YYYY');
    if (!endDate) return `${start} - Süresiz`;
    const end = dayjs(endDate).format('DD MMM YYYY');
    return `${start} - ${end}`;
  };

  const isExpired = (endDate: string | null) => {
    if (!endDate) return false;
    return dayjs(endDate).isBefore(dayjs(), 'day');
  };

  const getCurrencyIcon = (currency: string) => {
    const icons: Record<string, string> = {
      TRY: '₺',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    return icons[currency] || currency;
  };

  return (
    <PageContainer maxWidth="7xl">
      <ListPageHeader
        icon={<CurrencyDollarIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Fiyat Listeleri"
        description="Segment bazlı fiyatlandırma listelerini yönetin"
        itemCount={priceLists.length}
        primaryAction={{
          label: 'Yeni Fiyat Listesi',
          onClick: () => message.info('Yeni fiyat listesi formu açılıyor...'),
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      {priceLists.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Tags className="w-6 h-6" />}
            title="Henüz fiyat listesi yok"
            description="Müşterileriniz için fiyat listeleri oluşturun"
            action={{
              label: 'Fiyat Listesi Oluştur',
              onClick: () => message.info('Form açılıyor...'),
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {priceLists.map((priceList) => (
            <div
              key={priceList.id}
              className={`
                bg-white border rounded-lg shadow-sm transition-all duration-200
                hover:shadow-md hover:border-slate-300
                ${priceList.isActive ? 'border-slate-200' : 'border-slate-100 opacity-75'}
              `}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold
                        ${priceList.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}
                      `}
                    >
                      {getCurrencyIcon(priceList.currency)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 line-clamp-1">
                        {priceList.name}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {priceList.code}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === priceList.id ? null : priceList.id
                        )
                      }
                      className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                    {openDropdown === priceList.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenDropdown(null)}
                        />
                        <div className="absolute right-0 z-20 mt-1 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                handleViewItems(priceList.id);
                                setOpenDropdown(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                              <Eye className="w-4 h-4" />
                              Görüntüle
                            </button>
                            <button
                              onClick={() => setOpenDropdown(null)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                              <Edit2 className="w-4 h-4" />
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDeleteClick(priceList.id)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Sil
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {priceList.description}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                {/* Date Range */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span
                    className={`text-sm ${
                      isExpired(priceList.endDate)
                        ? 'text-red-500'
                        : 'text-slate-600'
                    }`}
                  >
                    {formatDateRange(priceList.startDate, priceList.endDate)}
                  </span>
                  {isExpired(priceList.endDate) && (
                    <Badge variant="error">Süresi Doldu</Badge>
                  )}
                </div>

                {/* Item Count */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Ürün Sayısı</span>
                  <span className="font-medium text-slate-700">
                    {priceList.itemCount.toLocaleString('tr-TR')}
                  </span>
                </div>

                {/* Linked Segments */}
                {priceList.linkedSegments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {priceList.linkedSegments.map((segment) => (
                      <span
                        key={segment}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700"
                      >
                        {segment}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    size="small"
                    checked={priceList.isActive}
                    onChange={() =>
                      handleToggleActive(priceList.id, priceList.isActive)
                    }
                  />
                  <span
                    className={`text-xs font-medium ${
                      priceList.isActive ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {priceList.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <button
                  onClick={() => handleViewItems(priceList.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Öğeleri Gör
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
