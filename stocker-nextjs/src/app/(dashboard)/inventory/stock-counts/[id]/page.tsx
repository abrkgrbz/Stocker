'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  Space,
  Table,
  Tag,
  Spin,
  Alert,
  Modal,
  Progress,
  InputNumber,
  Input,
  Empty,
} from 'antd';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  CalendarIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
  ExclamationCircleIcon,
  EyeIcon,
  MapPinIcon,
  MinusIcon,
  PencilIcon,
  PlayCircleIcon,
  PrinterIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useStockCount,
  useStartStockCount,
  useCompleteStockCount,
  useApproveStockCount,
  useCancelStockCount,
  useCountStockCountItem,
} from '@/lib/api/hooks/useInventory';
import type { StockCountStatus, StockCountType, StockCountItemDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusConfig: Record<StockCountStatus, { label: string; bgColor: string; textColor: string; icon: React.ReactNode }> = {
  Draft: { label: 'Taslak', bgColor: 'bg-slate-100', textColor: 'text-slate-600', icon: <PencilIcon className="w-4 h-4" /> },
  InProgress: { label: 'Devam Ediyor', bgColor: 'bg-blue-50', textColor: 'text-blue-700', icon: <PlayCircleIcon className="w-4 h-4" /> },
  Completed: { label: 'Tamamlandı', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Approved: { label: 'Onaylandı', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Rejected: { label: 'Reddedildi', bgColor: 'bg-red-50', textColor: 'text-red-700', icon: <XCircleIcon className="w-4 h-4" /> },
  Adjusted: { label: 'Düzeltildi', bgColor: 'bg-purple-50', textColor: 'text-purple-700', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Cancelled: { label: 'İptal', bgColor: 'bg-red-50', textColor: 'text-red-700', icon: <XCircleIcon className="w-4 h-4" /> },
};

const countTypeConfig: Record<StockCountType, { label: string; bgColor: string; textColor: string }> = {
  Full: { label: 'Tam Sayım', bgColor: 'bg-slate-100', textColor: 'text-slate-700' },
  Cycle: { label: 'Periyodik Sayım', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  Spot: { label: 'Anlık Sayım', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  Annual: { label: 'Yıllık Sayım', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  Category: { label: 'Kategori Sayımı', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700' },
  Location: { label: 'Lokasyon Sayımı', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
  ABC: { label: 'ABC Sayımı', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
  Perpetual: { label: 'Sürekli Sayım', bgColor: 'bg-rose-50', textColor: 'text-rose-700' },
};

export default function StockCountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [countModalVisible, setCountModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockCountItemDto | null>(null);
  const [countedQuantity, setCountedQuantity] = useState<number>(0);
  const [countNotes, setCountNotes] = useState('');

  const { data: stockCount, isLoading, error, refetch } = useStockCount(id);
  const startCount = useStartStockCount();
  const completeCount = useCompleteStockCount();
  const approveCount = useApproveStockCount();
  const cancelCount = useCancelStockCount();
  const recordCount = useCountStockCountItem();

  const handleStart = () => {
    Modal.confirm({
      title: 'Sayımı Başlat',
      content: 'Bu sayımı başlatmak istediğinizden emin misiniz?',
      okText: 'Başlat',
      cancelText: 'İptal',
      onOk: async () => {
        await startCount.mutateAsync({ id, countedByUserId: 1 });
      },
    });
  };

  const handleComplete = () => {
    Modal.confirm({
      title: 'Sayımı Tamamla',
      content: 'Bu sayımı tamamlamak istediğinizden emin misiniz? Tamamlandıktan sonra değişiklik yapılamaz.',
      okText: 'Tamamla',
      cancelText: 'İptal',
      onOk: async () => {
        await completeCount.mutateAsync(id);
      },
    });
  };

  const handleApprove = () => {
    Modal.confirm({
      title: 'Sayımı Onayla',
      content: stockCount?.autoAdjust
        ? 'Bu sayımı onaylamak istediğinizden emin misiniz? Stok farkları otomatik düzeltilecektir.'
        : 'Bu sayımı onaylamak istediğinizden emin misiniz?',
      okText: 'Onayla',
      cancelText: 'İptal',
      onOk: async () => {
        await approveCount.mutateAsync({ id, approvedByUserId: 1 });
      },
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Sayımı İptal Et',
      content: 'Bu sayımı iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        await cancelCount.mutateAsync({ id, reason: 'Kullanıcı tarafından iptal edildi' });
      },
    });
  };

  const handleRecordCount = async () => {
    if (!selectedItem) return;
    try {
      await recordCount.mutateAsync({
        stockCountId: id,
        itemId: selectedItem.id,
        countedQuantity,
        notes: countNotes || undefined,
      });
      setCountModalVisible(false);
      setSelectedItem(null);
      setCountedQuantity(0);
      setCountNotes('');
      refetch();
    } catch {
      // Error handled by hook
    }
  };

  const openCountModal = (item: StockCountItemDto) => {
    setSelectedItem(item);
    setCountedQuantity(item.countedQuantity ?? item.systemQuantity);
    setCountNotes(item.notes || '');
    setCountModalVisible(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !stockCount) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Alert
          message="Hata"
          description="Sayım bilgileri yüklenemedi"
          type="error"
          showIcon
          action={<Button onClick={() => router.back()}>Geri Dön</Button>}
        />
      </div>
    );
  }

  const config = statusConfig[stockCount.status];
  const typeConfig = countTypeConfig[stockCount.countType];
  const progressPercent = stockCount.totalItems > 0
    ? Math.round((stockCount.countedItems / stockCount.totalItems) * 100)
    : 0;

  const getProgressColor = (percent: number) => {
    if (percent === 100) return 'text-emerald-600';
    if (percent > 50) return 'text-blue-600';
    return 'text-amber-600';
  };

  const getActionButtons = () => {
    const buttons: React.ReactNode[] = [];

    switch (stockCount.status) {
      case 'Draft':
        buttons.push(
          <Button
            key="start"
            type="primary"
            icon={<PlayCircleIcon className="w-4 h-4" />}
            onClick={handleStart}
            style={{ background: '#1e293b', borderColor: '#1e293b' }}
          >
            Başlat
          </Button>,
          <Button key="cancel" danger icon={<XCircleIcon className="w-4 h-4" />} onClick={handleCancel}>
            İptal Et
          </Button>
        );
        break;
      case 'InProgress':
        buttons.push(
          <Button
            key="complete"
            type="primary"
            icon={<CheckCircleIcon className="w-4 h-4" />}
            onClick={handleComplete}
            disabled={stockCount.countedItems < stockCount.totalItems}
            style={{ background: '#1e293b', borderColor: '#1e293b' }}
          >
            Tamamla
          </Button>,
          <Button key="cancel" danger icon={<XCircleIcon className="w-4 h-4" />} onClick={handleCancel}>
            İptal Et
          </Button>
        );
        break;
      case 'Completed':
        buttons.push(
          <Button
            key="approve"
            type="primary"
            icon={<CheckCircleIcon className="w-4 h-4" />}
            onClick={handleApprove}
            style={{ background: '#1e293b', borderColor: '#1e293b' }}
          >
            Onayla
          </Button>
        );
        break;
    }

    return buttons;
  };

  const itemColumns: ColumnsType<StockCountItemDto> = [
    {
      title: 'Ürün Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Lokasyon',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 120,
      render: (name) => name || '-',
    },
    {
      title: 'Sistem Stok',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      width: 100,
      align: 'right',
    },
    {
      title: 'Sayılan',
      dataIndex: 'countedQuantity',
      key: 'countedQuantity',
      width: 100,
      align: 'right',
      render: (qty, record) =>
        record.isCounted ? (
          <span className="font-medium text-slate-900">{qty}</span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      title: 'Fark',
      dataIndex: 'difference',
      key: 'difference',
      width: 100,
      align: 'right',
      render: (diff, record) => {
        if (!record.isCounted) return '-';
        if (diff === 0) return <span className="text-slate-400">0</span>;
        if (diff > 0)
          return (
            <span className="text-emerald-600 flex items-center justify-end gap-1">
              <ArrowUpIcon className="w-4 h-4" /> +{diff}
            </span>
          );
        return (
          <span className="text-red-500 flex items-center justify-end gap-1">
            <ArrowDownIcon className="w-4 h-4" /> {diff}
          </span>
        );
      },
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => {
        if (!record.isCounted) {
          return <Tag className="border-0 bg-slate-100 text-slate-500">Sayılmadı</Tag>;
        }
        if (record.hasDifference) {
          return (
            <Tag icon={<ExclamationCircleIcon className="w-4 h-4" />} className="border-0 bg-amber-50 text-amber-700">
              Farklı
            </Tag>
          );
        }
        return (
          <Tag icon={<CheckCircleIcon className="w-4 h-4" />} className="border-0 bg-emerald-50 text-emerald-700">
            Eşleşti
          </Tag>
        );
      },
    },
    {
      title: 'Lot/Seri',
      key: 'tracking',
      width: 120,
      render: (_, record) => (
        <div className="text-xs text-slate-500">
          {record.lotNumber && <div>Lot: {record.lotNumber}</div>}
          {record.serialNumber && <div>Seri: {record.serialNumber}</div>}
          {!record.lotNumber && !record.serialNumber && '-'}
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 120,
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
          {stockCount.status === 'InProgress' && (
            <Button
              type="primary"
              size="small"
              onClick={() => openCountModal(record)}
              style={{ background: '#1e293b', borderColor: '#1e293b' }}
            >
              {record.isCounted ? 'Düzenle' : 'Say'}
            </Button>
          )}
        </Space>
      ),
    },
  ];

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
              <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center">
                <DocumentMagnifyingGlassIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{stockCount.countNumber}</h1>
                  <Tag
                    icon={config.icon}
                    className={`border-0 ${config.bgColor} ${config.textColor}`}
                  >
                    {config.label}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {typeConfig.label} | {stockCount.warehouseName}
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<PrinterIcon className="w-4 h-4" />}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              Yazdır
            </Button>
            {getActionButtons()}
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
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <DocumentMagnifyingGlassIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Toplam Kalem
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{stockCount.totalItems}</span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Sayılan
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-purple-600">{stockCount.countedItems}</span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <ExclamationCircleIcon className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Farklı
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span
                  className={`text-3xl font-bold ${
                    stockCount.itemsWithDifferenceCount > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {stockCount.itemsWithDifferenceCount}
                </span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  {stockCount.totalDifference > 0 ? (
                    <ArrowUpIcon className="w-5 h-5 text-emerald-600" />
                  ) : stockCount.totalDifference < 0 ? (
                    <ArrowDownIcon className="w-5 h-5 text-red-600" />
                  ) : (
                    <MinusIcon className="w-5 h-5 text-slate-600" />
                  )}
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Net Fark
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span
                  className={`text-3xl font-bold ${
                    stockCount.totalDifference > 0
                      ? 'text-emerald-600'
                      : stockCount.totalDifference < 0
                      ? 'text-red-600'
                      : 'text-slate-600'
                  }`}
                >
                  {stockCount.totalDifference > 0 ? '+' : ''}
                  {stockCount.totalDifference}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Sayım İlerlemesi
              </p>
              <div className="flex items-center justify-center">
                <Progress
                  type="circle"
                  percent={progressPercent}
                  size={120}
                  strokeColor="#8b5cf6"
                  format={() => (
                    <div className="text-center">
                      <span className={`text-2xl font-bold ${getProgressColor(progressPercent)}`}>
                        {stockCount.countedItems}
                      </span>
                      <span className="text-slate-400 text-lg">/{stockCount.totalItems}</span>
                    </div>
                  )}
                />
              </div>
              <div className="mt-4 text-center">
                <span className="text-sm text-slate-500">
                  {stockCount.totalItems - stockCount.countedItems} kalem sayılmayı bekliyor
                </span>
              </div>
            </div>
          </div>

          {/* Count Info Section */}
          <div className="col-span-12 md:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Sayım Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Sayım Tarihi</p>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(stockCount.countDate).format('DD/MM/YYYY')}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Depo</p>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">{stockCount.warehouseName}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Lokasyon</p>
                  <span className="text-sm font-medium text-slate-900">
                    {stockCount.locationName || 'Tüm Depo'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Sayım Türü</p>
                  <Tag className={`border-0 ${typeConfig.bgColor} ${typeConfig.textColor}`}>
                    {typeConfig.label}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Otomatik Düzeltme</p>
                  <Tag
                    className={`border-0 ${
                      stockCount.autoAdjust
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {stockCount.autoAdjust ? 'Evet' : 'Hayır'}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Oluşturulma</p>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(stockCount.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
                {stockCount.description && (
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-xs text-slate-400 mb-1">Açıklama</p>
                    <p className="text-sm text-slate-600">{stockCount.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Özet
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Sistem Toplam</span>
                  <span className="text-sm font-semibold text-slate-900">{stockCount.totalSystemQuantity}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Sayılan Toplam</span>
                  <span className="text-sm font-semibold text-slate-900">{stockCount.totalCountedQuantity}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-500">Net Fark</span>
                  <span
                    className={`text-sm font-semibold ${
                      stockCount.totalDifference > 0
                        ? 'text-emerald-600'
                        : stockCount.totalDifference < 0
                        ? 'text-red-600'
                        : 'text-slate-900'
                    }`}
                  >
                    {stockCount.totalDifference > 0 ? '+' : ''}
                    {stockCount.totalDifference}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table Section */}
          <div className="col-span-12 md:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Sayım Kalemleri ({stockCount.items?.length || 0})
              </p>
              <Table
                columns={itemColumns}
                dataSource={stockCount.items || []}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1000 }}
                className="[&_.ant-table]:border-slate-200 [&_.ant-table-thead_.ant-table-cell]:bg-slate-50 [&_.ant-table-thead_.ant-table-cell]:text-slate-600 [&_.ant-table-thead_.ant-table-cell]:font-medium"
                rowClassName={(record) =>
                  record.hasDifference
                    ? 'bg-amber-50/50'
                    : record.isCounted
                    ? 'bg-emerald-50/30'
                    : ''
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Count Modal */}
      <Modal
        title={
          <span className="text-slate-900 font-semibold">Sayım: {selectedItem?.productName}</span>
        }
        open={countModalVisible}
        onOk={handleRecordCount}
        onCancel={() => {
          setCountModalVisible(false);
          setSelectedItem(null);
        }}
        confirmLoading={recordCount.isPending}
        okText="Kaydet"
        cancelText="İptal"
        okButtonProps={{ style: { background: '#1e293b', borderColor: '#1e293b' } }}
      >
        {selectedItem && (
          <div className="py-4 space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-slate-500">Ürün Kodu:</span>
                <span className="font-medium text-slate-900">{selectedItem.productCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sistem Stok:</span>
                <span className="font-medium text-slate-900">{selectedItem.systemQuantity}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-2">Sayılan Miktar:</p>
              <InputNumber
                value={countedQuantity}
                onChange={(val) => setCountedQuantity(val || 0)}
                min={0}
                style={{ width: '100%' }}
                size="large"
              />
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-2">Not (opsiyonel):</p>
              <Input.TextArea
                value={countNotes}
                onChange={(e) => setCountNotes(e.target.value)}
                rows={2}
                placeholder="Sayım notu..."
              />
            </div>

            {countedQuantity !== selectedItem.systemQuantity && (
              <div
                className={`p-3 rounded-lg ${
                  countedQuantity > selectedItem.systemQuantity
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                <span className="font-medium">
                  Fark: {countedQuantity - selectedItem.systemQuantity > 0 ? '+' : ''}
                  {countedQuantity - selectedItem.systemQuantity}
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
