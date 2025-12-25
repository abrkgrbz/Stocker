'use client';

/**
 * Warranty Lookup Page
 * Search-first interface for checking product warranty status
 */

import React, { useState, useMemo } from 'react';
import { Input, message } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import {
  Search,
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Clock,
  Package,
  Calendar,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Barcode,
  History,
} from 'lucide-react';
import {
  PageContainer,
  ListPageHeader,
  Card,
  Badge,
} from '@/components/ui/enterprise-page';
import { SafetyCertificateOutlined } from '@ant-design/icons';

dayjs.locale('tr');

// Types
type WarrantyStatus = 'Active' | 'Expired' | 'Void' | 'Extended';

interface WarrantyRecord {
  id: string;
  serialNumber: string;
  productName: string;
  productSku: string;
  productCategory: string;
  purchaseDate: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  extendedWarrantyEndDate: string | null;
  status: WarrantyStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  invoiceNumber: string;
  purchaseStore: string;
  serviceHistory: {
    date: string;
    type: string;
    description: string;
    technician: string;
  }[];
  notes: string;
}

// Mock data
const mockWarrantyRecords: WarrantyRecord[] = [
  {
    id: '1',
    serialNumber: 'SN-SAM-2024-001234',
    productName: 'Samsung Galaxy S24 Ultra',
    productSku: 'SAM-S24U-256-BLK',
    productCategory: 'Akıllı Telefon',
    purchaseDate: '2024-03-15',
    warrantyStartDate: '2024-03-15',
    warrantyEndDate: '2026-03-15',
    extendedWarrantyEndDate: '2027-03-15',
    status: 'Extended',
    customerName: 'Ahmet Yıldırım',
    customerEmail: 'ahmet.yildirim@email.com',
    customerPhone: '+90 532 111 2233',
    customerAddress: 'Kadıköy, İstanbul',
    invoiceNumber: 'INV-2024-003456',
    purchaseStore: 'Stocker Kadıköy',
    serviceHistory: [
      {
        date: '2024-08-20',
        type: 'Ekran Değişimi',
        description: 'Kırık ekran değiştirildi - garanti kapsamında',
        technician: 'Mehmet Kaya',
      },
    ],
    notes: '+1 yıl uzatılmış garanti satın alındı',
  },
  {
    id: '2',
    serialNumber: 'SN-APL-2023-005678',
    productName: 'iPhone 14 Pro',
    productSku: 'APL-14P-128-GLD',
    productCategory: 'Akıllı Telefon',
    purchaseDate: '2023-01-10',
    warrantyStartDate: '2023-01-10',
    warrantyEndDate: '2025-01-10',
    extendedWarrantyEndDate: null,
    status: 'Active',
    customerName: 'Zeynep Arslan',
    customerEmail: 'zeynep.arslan@email.com',
    customerPhone: '+90 533 222 3344',
    customerAddress: 'Beşiktaş, İstanbul',
    invoiceNumber: 'INV-2023-001234',
    purchaseStore: 'Stocker Beşiktaş',
    serviceHistory: [],
    notes: '',
  },
  {
    id: '3',
    serialNumber: 'SN-DEL-2022-009012',
    productName: 'Dell XPS 15',
    productSku: 'DEL-XPS15-I7-512',
    productCategory: 'Dizüstü Bilgisayar',
    purchaseDate: '2022-06-20',
    warrantyStartDate: '2022-06-20',
    warrantyEndDate: '2024-06-20',
    extendedWarrantyEndDate: null,
    status: 'Expired',
    customerName: 'Can Özkan',
    customerEmail: 'can.ozkan@email.com',
    customerPhone: '+90 534 333 4455',
    customerAddress: 'Çankaya, Ankara',
    invoiceNumber: 'INV-2022-007890',
    purchaseStore: 'Stocker Ankara',
    serviceHistory: [
      {
        date: '2023-02-15',
        type: 'Batarya Değişimi',
        description: 'Şişen batarya değiştirildi',
        technician: 'Ali Demir',
      },
      {
        date: '2023-11-10',
        type: 'Fan Temizliği',
        description: 'Aşırı ısınma için fan temizliği yapıldı',
        technician: 'Ali Demir',
      },
    ],
    notes: 'Müşteriye garanti uzatma teklif edildi',
  },
  {
    id: '4',
    serialNumber: 'SN-SNY-2024-003456',
    productName: 'Sony PlayStation 5',
    productSku: 'SNY-PS5-DISC',
    productCategory: 'Oyun Konsolu',
    purchaseDate: '2024-01-05',
    warrantyStartDate: '2024-01-05',
    warrantyEndDate: '2026-01-05',
    extendedWarrantyEndDate: null,
    status: 'Void',
    customerName: 'Emre Demir',
    customerEmail: 'emre.demir@email.com',
    customerPhone: '+90 535 444 5566',
    customerAddress: 'Karşıyaka, İzmir',
    invoiceNumber: 'INV-2024-000567',
    purchaseStore: 'Stocker İzmir',
    serviceHistory: [
      {
        date: '2024-06-01',
        type: 'İnceleme',
        description: 'Fiziksel hasar tespit edildi - garanti geçersiz',
        technician: 'Mehmet Kaya',
      },
    ],
    notes: 'Ürün su hasarı almış - garanti kapsamı dışı',
  },
  {
    id: '5',
    serialNumber: 'SN-APL-2024-007890',
    productName: 'MacBook Pro 14" M3',
    productSku: 'APL-MBP14-M3-512',
    productCategory: 'Dizüstü Bilgisayar',
    purchaseDate: '2024-09-01',
    warrantyStartDate: '2024-09-01',
    warrantyEndDate: '2025-09-01',
    extendedWarrantyEndDate: '2027-09-01',
    status: 'Extended',
    customerName: 'Ayşe Kara',
    customerEmail: 'ayse.kara@email.com',
    customerPhone: '+90 536 555 6677',
    customerAddress: 'Nilüfer, Bursa',
    invoiceNumber: 'INV-2024-008901',
    purchaseStore: 'Stocker Bursa',
    serviceHistory: [],
    notes: 'AppleCare+ satın alındı',
  },
];

export default function WarrantyLookupPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WarrantyRecord | null>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return mockWarrantyRecords.filter(
      (record) =>
        record.serialNumber.toLowerCase().includes(query) ||
        record.productName.toLowerCase().includes(query) ||
        record.invoiceNumber.toLowerCase().includes(query) ||
        record.customerName.toLowerCase().includes(query) ||
        record.customerPhone.includes(query)
    );
  }, [searchQuery]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      message.warning('Lütfen bir arama terimi girin');
      return;
    }
    setSearchPerformed(true);
    setSelectedRecord(null);
  };

  const getStatusConfig = (status: WarrantyStatus) => {
    switch (status) {
      case 'Active':
        return {
          icon: <ShieldCheck className="w-5 h-5" />,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          label: 'Aktif',
          description: 'Garanti kapsamında',
        };
      case 'Extended':
        return {
          icon: <Shield className="w-5 h-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Uzatılmış',
          description: 'Uzatılmış garanti aktif',
        };
      case 'Expired':
        return {
          icon: <ShieldX className="w-5 h-5" />,
          color: 'text-slate-500',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          label: 'Sona Erdi',
          description: 'Garanti süresi doldu',
        };
      case 'Void':
        return {
          icon: <ShieldAlert className="w-5 h-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Geçersiz',
          description: 'Garanti iptal edildi',
        };
    }
  };

  const calculateRemainingDays = (endDate: string) => {
    const end = dayjs(endDate);
    const today = dayjs();
    const diff = end.diff(today, 'day');
    return diff;
  };

  const formatRemainingTime = (endDate: string) => {
    const days = calculateRemainingDays(endDate);
    if (days < 0) return 'Süresi doldu';
    if (days === 0) return 'Bugün doluyor';
    if (days < 30) return `${days} gün kaldı`;
    if (days < 365) return `${Math.floor(days / 30)} ay kaldı`;
    return `${Math.floor(days / 365)} yıl ${Math.floor((days % 365) / 30)} ay kaldı`;
  };

  return (
    <PageContainer maxWidth="5xl">
      <ListPageHeader
        icon={<SafetyCertificateOutlined />}
        iconColor="#059669"
        title="Garanti Sorgulama"
        description="Ürün garanti durumunu kontrol edin"
      />

      {/* Search Section */}
      <Card className="mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Garanti Durumu Sorgula
            </h2>
            <p className="text-slate-500">
              Seri numarası, fatura numarası veya müşteri bilgisi ile arayın
            </p>
          </div>

          <div className="flex gap-3">
            <Input
              size="large"
              placeholder="Seri no, fatura no veya müşteri adı..."
              prefix={<Search className="w-5 h-5 text-slate-400" />}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchPerformed(false);
              }}
              onPressEnter={handleSearch}
              className="flex-1"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Ara
            </button>
          </div>

          {/* Quick Search Examples */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="text-xs text-slate-400">Örnek:</span>
            {['SN-SAM-2024', 'INV-2024', 'iPhone'].map((example) => (
              <button
                key={example}
                onClick={() => {
                  setSearchQuery(example);
                  setSearchPerformed(false);
                }}
                className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Search Results */}
      {searchPerformed && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results List */}
          <div className={selectedRecord ? 'lg:col-span-1' : 'lg:col-span-3'}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">
                Arama Sonuçları
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({searchResults.length} kayıt)
                </span>
              </h3>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((record) => {
                  const statusConfig = getStatusConfig(record.status);
                  const isSelected = selectedRecord?.id === record.id;
                  const effectiveEndDate =
                    record.extendedWarrantyEndDate || record.warrantyEndDate;
                  const remainingDays = calculateRemainingDays(effectiveEndDate);

                  return (
                    <div
                      key={record.id}
                      onClick={() => setSelectedRecord(record)}
                      className={`
                        bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200
                        ${
                          isSelected
                            ? 'border-emerald-400 ring-2 ring-emerald-100 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Status Badge */}
                          <div
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium mb-2 ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </div>

                          {/* Product Name */}
                          <h4 className="font-semibold text-slate-900 mb-1 truncate">
                            {record.productName}
                          </h4>

                          {/* Serial Number */}
                          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                            <Barcode className="w-4 h-4" />
                            <span className="font-mono">{record.serialNumber}</span>
                          </div>

                          {/* Customer */}
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <User className="w-4 h-4" />
                            <span>{record.customerName}</span>
                          </div>
                        </div>

                        {/* Remaining Time */}
                        <div className="text-right shrink-0">
                          {record.status === 'Active' || record.status === 'Extended' ? (
                            <div
                              className={`text-sm font-medium ${
                                remainingDays < 30
                                  ? 'text-amber-600'
                                  : remainingDays < 90
                                  ? 'text-blue-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {formatRemainingTime(effectiveEndDate)}
                            </div>
                          ) : (
                            <div className="text-sm text-slate-400">-</div>
                          )}
                          <ChevronRight className="w-5 h-5 text-slate-300 mt-2 ml-auto" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Sonuç Bulunamadı</h3>
                <p className="text-slate-500 text-sm">
                  &quot;{searchQuery}&quot; için eşleşen kayıt bulunamadı.
                  <br />
                  Seri numarası veya fatura numarasını kontrol edin.
                </p>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedRecord && (
            <div className="lg:col-span-2">
              <Card>
                {(() => {
                  const statusConfig = getStatusConfig(selectedRecord.status);
                  const effectiveEndDate =
                    selectedRecord.extendedWarrantyEndDate || selectedRecord.warrantyEndDate;
                  const remainingDays = calculateRemainingDays(effectiveEndDate);

                  return (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 mb-1">
                            {selectedRecord.productName}
                          </h3>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Barcode className="w-4 h-4" />
                            <span className="font-mono text-sm">
                              {selectedRecord.serialNumber}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}
                        >
                          {statusConfig.icon}
                          <div>
                            <div className="font-semibold">{statusConfig.label}</div>
                            <div className="text-xs opacity-80">{statusConfig.description}</div>
                          </div>
                        </div>
                      </div>

                      {/* Warranty Timeline */}
                      {(selectedRecord.status === 'Active' ||
                        selectedRecord.status === 'Extended') && (
                        <div
                          className={`p-4 rounded-lg ${
                            remainingDays < 30
                              ? 'bg-amber-50 border border-amber-200'
                              : remainingDays < 90
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Clock
                                className={`w-5 h-5 ${
                                  remainingDays < 30
                                    ? 'text-amber-600'
                                    : remainingDays < 90
                                    ? 'text-blue-600'
                                    : 'text-emerald-600'
                                }`}
                              />
                              <div>
                                <div className="font-medium text-slate-900">
                                  Kalan Süre: {formatRemainingTime(effectiveEndDate)}
                                </div>
                                <div className="text-sm text-slate-500">
                                  Bitiş: {dayjs(effectiveEndDate).format('DD MMMM YYYY')}
                                </div>
                              </div>
                            </div>
                            {remainingDays < 30 && (
                              <Badge variant="warning">Yakında Doluyor</Badge>
                            )}
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  remainingDays < 30
                                    ? 'bg-amber-500'
                                    : remainingDays < 90
                                    ? 'bg-blue-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(
                                      100,
                                      (remainingDays /
                                        dayjs(effectiveEndDate).diff(
                                          selectedRecord.warrantyStartDate,
                                          'day'
                                        )) *
                                        100
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <Package className="w-4 h-4" />
                            <span className="text-xs">Ürün Kodu</span>
                          </div>
                          <div className="font-medium text-slate-900 font-mono text-sm">
                            {selectedRecord.productSku}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs">Fatura No</span>
                          </div>
                          <div className="font-medium text-slate-900 font-mono text-sm">
                            {selectedRecord.invoiceNumber}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs">Satın Alma Tarihi</span>
                          </div>
                          <div className="font-medium text-slate-900">
                            {dayjs(selectedRecord.purchaseDate).format('DD MMMM YYYY')}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs">Satış Mağazası</span>
                          </div>
                          <div className="font-medium text-slate-900">
                            {selectedRecord.purchaseStore}
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="border-t border-slate-100 pt-4">
                        <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-500" />
                          Müşteri Bilgileri
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-900">{selectedRecord.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-900">{selectedRecord.customerPhone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-900">{selectedRecord.customerEmail}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-900">{selectedRecord.customerAddress}</span>
                          </div>
                        </div>
                      </div>

                      {/* Service History */}
                      <div className="border-t border-slate-100 pt-4">
                        <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                          <History className="w-4 h-4 text-slate-500" />
                          Servis Geçmişi
                        </h4>
                        {selectedRecord.serviceHistory.length > 0 ? (
                          <div className="space-y-3">
                            {selectedRecord.serviceHistory.map((service, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                              >
                                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center shrink-0">
                                  <Wrench className="w-4 h-4 text-violet-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium text-slate-900">
                                      {service.type}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {dayjs(service.date).format('DD MMM YYYY')}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-600 mt-1">
                                    {service.description}
                                  </p>
                                  <div className="text-xs text-slate-400 mt-1">
                                    Teknisyen: {service.technician}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-400">
                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Servis kaydı bulunmuyor</p>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {selectedRecord.notes && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <div className="text-sm font-medium text-amber-700 mb-1">Notlar</div>
                          <p className="text-amber-800 text-sm">{selectedRecord.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <button
                          onClick={() => setSelectedRecord(null)}
                          className="text-slate-500 hover:text-slate-700 text-sm font-medium"
                        >
                          Kapat
                        </button>
                        <div className="flex items-center gap-3">
                          <button className="px-4 py-2 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors text-sm font-medium">
                            Servis Talebi Oluştur
                          </button>
                          {(selectedRecord.status === 'Active' ||
                            selectedRecord.status === 'Extended') && (
                            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
                              Garantiyi Uzat
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Initial State - Before Search */}
      {!searchPerformed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-emerald-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {mockWarrantyRecords.filter((r) => r.status === 'Active').length}
            </div>
            <div className="text-sm text-slate-500">Aktif Garanti</div>
          </div>
          <div className="bg-white border border-blue-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {mockWarrantyRecords.filter((r) => r.status === 'Extended').length}
            </div>
            <div className="text-sm text-slate-500">Uzatılmış Garanti</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldX className="w-6 h-6 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-600">
              {mockWarrantyRecords.filter((r) => r.status === 'Expired').length}
            </div>
            <div className="text-sm text-slate-500">Süresi Dolan</div>
          </div>
          <div className="bg-white border border-red-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {mockWarrantyRecords.filter((r) => r.status === 'Void').length}
            </div>
            <div className="text-sm text-slate-500">Geçersiz Garanti</div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
