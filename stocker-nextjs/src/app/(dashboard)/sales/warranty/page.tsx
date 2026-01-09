'use client';

/**
 * Warranty Lookup Page
 * Search-first interface for checking product warranty status
 * Monochrome design system
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Input, message } from 'antd';
import { Spinner } from '@/components/primitives';
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
  ChevronRight,
  Barcode,
  History,
  Wrench,
  RefreshCw,
} from 'lucide-react';
import { SalesService, WarrantyListDto, WarrantyDto, WarrantyStatisticsDto } from '@/lib/api/services/sales.service';

dayjs.locale('tr');

export default function WarrantyLookupPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchResults, setSearchResults] = useState<WarrantyListDto[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<WarrantyDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statistics, setStatistics] = useState<WarrantyStatisticsDto | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStatistics = useCallback(async () => {
    try {
      setStatsLoading(true);
      const stats = await SalesService.getWarrantyStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching warranty statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      message.warning('Lutfen bir arama terimi girin');
      return;
    }

    try {
      setLoading(true);
      setSearchPerformed(true);
      setSelectedRecord(null);

      const lookupResult = await SalesService.lookupWarranty(searchQuery.trim()).catch(() => null);

      if (lookupResult) {
        setSearchResults([{
          id: lookupResult.id,
          warrantyNumber: lookupResult.warrantyNumber,
          productCode: lookupResult.productCode,
          productName: lookupResult.productName,
          serialNumber: lookupResult.serialNumber,
          customerName: lookupResult.customerName,
          startDate: lookupResult.startDate,
          endDate: lookupResult.endDate,
          remainingDays: lookupResult.remainingDays,
          type: lookupResult.type,
          coverageType: lookupResult.coverageType,
          status: lookupResult.status,
          isActive: lookupResult.isActive,
          isExpired: lookupResult.isExpired,
          claimCount: lookupResult.claimCount,
          createdAt: lookupResult.createdAt,
        }]);
      } else {
        const results = await SalesService.getWarranties({
          searchTerm: searchQuery.trim(),
          pageSize: 50,
        });
        setSearchResults(results.items);
      }
    } catch (error) {
      console.error('Error searching warranties:', error);
      message.error('Garanti aramasi yapilirken hata olustu');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecord = async (record: WarrantyListDto) => {
    try {
      setDetailLoading(true);
      const detail = await SalesService.getWarranty(record.id);
      setSelectedRecord(detail);
    } catch (error) {
      console.error('Error fetching warranty detail:', error);
      message.error('Garanti detayi yuklenirken hata olustu');
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusConfig = (status: string, isExpired?: boolean, isActive?: boolean) => {
    if (status === 'Void') {
      return {
        icon: <ShieldAlert className="w-5 h-5" />,
        color: 'text-slate-700',
        bgColor: 'bg-slate-300',
        borderColor: 'border-slate-400',
        label: 'Gecersiz',
        description: 'Garanti iptal edildi',
      };
    }
    if (isExpired) {
      return {
        icon: <ShieldX className="w-5 h-5" />,
        color: 'text-slate-500',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-200',
        label: 'Sona Erdi',
        description: 'Garanti suresi doldu',
      };
    }
    if (isActive) {
      return {
        icon: <ShieldCheck className="w-5 h-5" />,
        color: 'text-slate-900',
        bgColor: 'bg-slate-200',
        borderColor: 'border-slate-300',
        label: 'Aktif',
        description: 'Garanti kapsaminda',
      };
    }
    return {
      icon: <Shield className="w-5 h-5" />,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200',
      label: 'Beklemede',
      description: 'Garanti aktivasyonu bekleniyor',
    };
  };

  const formatRemainingTime = (remainingDays: number) => {
    if (remainingDays < 0) return 'Suresi doldu';
    if (remainingDays === 0) return 'Bugun doluyor';
    if (remainingDays < 30) return remainingDays + ' gun kaldi';
    if (remainingDays < 365) return Math.floor(remainingDays / 30) + ' ay kaldi';
    return Math.floor(remainingDays / 365) + ' yil ' + Math.floor((remainingDays % 365) / 30) + ' ay kaldi';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Garanti Sorgulama</h1>
              <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                {statistics?.totalCount ?? 0} kayit
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Urun garanti durumunu kontrol edin
            </p>
          </div>
        </div>
        <button
          onClick={fetchStatistics}
          className="inline-flex items-center gap-2 px-3 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-slate-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Garanti Durumu Sorgula
            </h2>
            <p className="text-slate-500">
              Seri numarasi, garanti numarasi veya musteri bilgisi ile arayin
            </p>
          </div>

          <div className="flex gap-3">
            <Input
              size="large"
              placeholder="Seri no, garanti no veya musteri adi..."
              prefix={<Search className="w-5 h-5 text-slate-400" />}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value.trim()) {
                  setSearchPerformed(false);
                  setSearchResults([]);
                }
              }}
              onPressEnter={handleSearch}
              className="flex-1"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? <Spinner size="sm" /> : 'Ara'}
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchPerformed && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results List */}
          <div className={selectedRecord ? 'lg:col-span-1' : 'lg:col-span-3'}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">
                Arama Sonuclari
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({searchResults.length} kayit)
                </span>
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((record) => {
                  const statusConfig = getStatusConfig(record.status, record.isExpired, record.isActive);
                  const isSelected = selectedRecord?.id === record.id;

                  return (
                    <div
                      key={record.id}
                      onClick={() => handleSelectRecord(record)}
                      className={
                        'bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200 ' +
                        (isSelected
                          ? 'border-slate-400 ring-2 ring-slate-200 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm')
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div
                            className={'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium mb-2 ' + statusConfig.bgColor + ' ' + statusConfig.color + ' border ' + statusConfig.borderColor}
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </div>

                          <h4 className="font-semibold text-slate-900 mb-1 truncate">
                            {record.productName}
                          </h4>

                          {record.serialNumber && (
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                              <Barcode className="w-4 h-4" />
                              <span className="font-mono">{record.serialNumber}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <User className="w-4 h-4" />
                            <span>{record.customerName}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {record.isActive ? (
                            <div
                              className={
                                'text-sm font-medium ' +
                                (record.remainingDays < 30
                                  ? 'text-slate-600'
                                  : record.remainingDays < 90
                                  ? 'text-slate-700'
                                  : 'text-slate-900')
                              }
                            >
                              {formatRemainingTime(record.remainingDays)}
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
                <h3 className="text-lg font-medium text-slate-900 mb-2">Sonuc Bulunamadi</h3>
                <p className="text-slate-500 text-sm">
                  &quot;{searchQuery}&quot; icin eslesen kayit bulunamadi.
                  <br />
                  Seri numarasi veya garanti numarasini kontrol edin.
                </p>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedRecord && (
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                {detailLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  (() => {
                    const statusConfig = getStatusConfig(selectedRecord.status, selectedRecord.isExpired, selectedRecord.isActive);

                    return (
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-1">
                              {selectedRecord.productName}
                            </h3>
                            <div className="flex items-center gap-4 text-slate-500">
                              {selectedRecord.serialNumber && (
                                <div className="flex items-center gap-2">
                                  <Barcode className="w-4 h-4" />
                                  <span className="font-mono text-sm">
                                    {selectedRecord.serialNumber}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span className="font-mono text-sm">
                                  {selectedRecord.warrantyNumber}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div
                            className={'flex items-center gap-2 px-3 py-2 rounded-lg ' + statusConfig.bgColor + ' ' + statusConfig.color + ' border ' + statusConfig.borderColor}
                          >
                            {statusConfig.icon}
                            <div>
                              <div className="font-semibold">{statusConfig.label}</div>
                              <div className="text-xs opacity-80">{statusConfig.description}</div>
                            </div>
                          </div>
                        </div>

                        {/* Warranty Timeline */}
                        {selectedRecord.isActive && (
                          <div
                            className={
                              'p-4 rounded-lg ' +
                              (selectedRecord.remainingDays < 30
                                ? 'bg-slate-200 border border-slate-300'
                                : selectedRecord.remainingDays < 90
                                ? 'bg-slate-100 border border-slate-200'
                                : 'bg-slate-50 border border-slate-100')
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Clock
                                  className={
                                    'w-5 h-5 ' +
                                    (selectedRecord.remainingDays < 30
                                      ? 'text-slate-700'
                                      : selectedRecord.remainingDays < 90
                                      ? 'text-slate-600'
                                      : 'text-slate-500')
                                  }
                                />
                                <div>
                                  <div className="font-medium text-slate-900">
                                    Kalan Sure: {formatRemainingTime(selectedRecord.remainingDays)}
                                  </div>
                                  <div className="text-sm text-slate-500">
                                    Bitis: {dayjs(selectedRecord.endDate).format('DD MMMM YYYY')}
                                  </div>
                                </div>
                              </div>
                              {selectedRecord.remainingDays < 30 && (
                                <span className="px-2.5 py-1 text-xs font-medium bg-slate-300 text-slate-700 rounded">
                                  Yakinda Doluyor
                                </span>
                              )}
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="h-2 bg-white rounded-full overflow-hidden">
                                <div
                                  className={
                                    'h-full rounded-full ' +
                                    (selectedRecord.remainingDays < 30
                                      ? 'bg-slate-700'
                                      : selectedRecord.remainingDays < 90
                                      ? 'bg-slate-600'
                                      : 'bg-slate-500')
                                  }
                                  style={{
                                    width: Math.max(0, Math.min(100, (selectedRecord.remainingDays / (selectedRecord.durationMonths * 30)) * 100)) + '%',
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
                              <span className="text-xs">Urun Kodu</span>
                            </div>
                            <div className="font-medium text-slate-900 font-mono text-sm">
                              {selectedRecord.productCode}
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                              <Shield className="w-4 h-4" />
                              <span className="text-xs">Garanti Tipi</span>
                            </div>
                            <div className="font-medium text-slate-900 text-sm">
                              {selectedRecord.type} - {selectedRecord.coverageType}
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                              <Calendar className="w-4 h-4" />
                              <span className="text-xs">Baslangic Tarihi</span>
                            </div>
                            <div className="font-medium text-slate-900">
                              {dayjs(selectedRecord.startDate).format('DD MMMM YYYY')}
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                              <Calendar className="w-4 h-4" />
                              <span className="text-xs">Bitis Tarihi</span>
                            </div>
                            <div className="font-medium text-slate-900">
                              {dayjs(selectedRecord.endDate).format('DD MMMM YYYY')}
                            </div>
                          </div>
                        </div>

                        {/* Coverage Info */}
                        {selectedRecord.coverageDescription && (
                          <div className="bg-slate-100 border border-slate-200 rounded-lg p-3">
                            <div className="text-sm font-medium text-slate-700 mb-1">Kapsam Aciklamasi</div>
                            <p className="text-slate-800 text-sm">{selectedRecord.coverageDescription}</p>
                          </div>
                        )}

                        {/* Customer Info */}
                        <div className="border-t border-slate-100 pt-4">
                          <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-500" />
                            Musteri Bilgileri
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-900">{selectedRecord.customerName}</span>
                            </div>
                            {selectedRecord.customerPhone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-900">{selectedRecord.customerPhone}</span>
                              </div>
                            )}
                            {selectedRecord.customerEmail && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-900">{selectedRecord.customerEmail}</span>
                              </div>
                            )}
                            {selectedRecord.customerAddress && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-900">{selectedRecord.customerAddress}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Claims History */}
                        <div className="border-t border-slate-100 pt-4">
                          <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                            <History className="w-4 h-4 text-slate-500" />
                            Talep Gecmisi
                            {selectedRecord.claimCount > 0 && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded">
                                {selectedRecord.claimCount} talep
                              </span>
                            )}
                          </h4>
                          {selectedRecord.claims && selectedRecord.claims.length > 0 ? (
                            <div className="space-y-3">
                              {selectedRecord.claims.map((claim, index) => (
                                <div
                                  key={claim.id || index}
                                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                                >
                                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                                    <Wrench className="w-4 h-4 text-slate-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-medium text-slate-900">
                                        {claim.claimNumber}
                                      </span>
                                      <span className="text-xs text-slate-500">
                                        {dayjs(claim.claimDate).format('DD MMM YYYY')}
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">
                                      {claim.issueDescription}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span
                                        className={
                                          'px-2 py-0.5 text-xs font-medium rounded ' +
                                          (claim.status === 'Approved' ? 'bg-slate-900 text-white' :
                                          claim.status === 'Rejected' ? 'bg-slate-300 text-slate-700' :
                                          'bg-slate-100 text-slate-600')
                                        }
                                      >
                                        {claim.status}
                                      </span>
                                      {claim.resolution && (
                                        <span className="text-xs text-slate-500">
                                          Cozum: {claim.resolution}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-slate-400">
                              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Talep kaydi bulunmuyor</p>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {selectedRecord.notes && (
                          <div className="bg-slate-100 border border-slate-200 rounded-lg p-3">
                            <div className="text-sm font-medium text-slate-700 mb-1">Notlar</div>
                            <p className="text-slate-800 text-sm">{selectedRecord.notes}</p>
                          </div>
                        )}

                        {/* Void Reason */}
                        {selectedRecord.isVoid && selectedRecord.voidReason && (
                          <div className="bg-slate-200 border border-slate-300 rounded-lg p-3">
                            <div className="text-sm font-medium text-slate-700 mb-1">Iptal Sebebi</div>
                            <p className="text-slate-800 text-sm">{selectedRecord.voidReason}</p>
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
                            <button className="px-4 py-2 text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium">
                              Servis Talebi Olustur
                            </button>
                            {selectedRecord.isActive && (
                              <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
                                Garantiyi Uzat
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial State - Before Search */}
      {!searchPerformed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 text-center animate-pulse">
                  <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto mb-3" />
                  <div className="h-8 bg-slate-100 rounded w-16 mx-auto mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-24 mx-auto" />
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6 text-slate-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {statistics?.activeCount ?? 0}
                </div>
                <div className="text-sm text-slate-500">Aktif Garanti</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-slate-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {statistics?.expiringThisMonthCount ?? 0}
                </div>
                <div className="text-sm text-slate-500">Bu Ay Dolacak</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldX className="w-6 h-6 text-slate-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {statistics?.expiredCount ?? 0}
                </div>
                <div className="text-sm text-slate-500">Suresi Dolan</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <History className="w-6 h-6 text-slate-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {statistics?.totalClaimCount ?? 0}
                </div>
                <div className="text-sm text-slate-500">Toplam Talep</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
