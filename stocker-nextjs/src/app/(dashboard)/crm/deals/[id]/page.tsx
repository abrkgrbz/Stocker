'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Tag,
  Spin,
  Empty,
  Modal,
  Tabs,
  Tooltip,
  Progress,
} from 'antd';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  DocumentTextIcon,
  PencilIcon,
  PlusIcon,
  TrophyIcon,
  UserIcon,
  XCircleIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  FlagIcon,
  BuildingStorefrontIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useDeal, useCreateActivity, useCloseDealWon, useCloseDealLost } from '@/lib/api/hooks/useCRM';
import { DocumentUpload } from '@/components/crm/shared';
import { ActivityModal } from '@/features/activities/components';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import type { Guid } from '@/lib/api/services/crm.types';

dayjs.extend(relativeTime);
dayjs.locale('tr');

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as Guid;

  const [activeTab, setActiveTab] = useState('activities');
  const [activityModalOpen, setActivityModalOpen] = useState(false);

  // Fetch deal data from API
  const { data: deal, isLoading, error } = useDeal(dealId);
  const createActivity = useCreateActivity();
  const closeDealWon = useCloseDealWon();
  const closeDealLost = useCloseDealLost();

  // Handle activity submission
  const handleActivitySubmit = async (values: any) => {
    try {
      const activityData = {
        ...values,
        dealId: values.dealId || dealId,
      };
      await createActivity.mutateAsync(activityData);
      setActivityModalOpen(false);
      showSuccess('Aktivite başarıyla oluşturuldu');
    } catch (error) {
      showApiError(error, 'Aktivite oluşturulurken bir hata oluştu');
    }
  };

  // Handle close won
  const handleCloseWon = async () => {
    Modal.confirm({
      title: 'Fırsatı Kazanıldı Olarak İşaretle',
      content: `"${deal?.title}" fırsatını kazanıldı olarak işaretlemek istediğinizden emin misiniz?`,
      okText: 'Kazanıldı İşaretle',
      cancelText: 'İptal',
      okButtonProps: { className: 'bg-emerald-600 hover:bg-emerald-700' },
      onOk: async () => {
        try {
          await closeDealWon.mutateAsync({
            id: dealId,
            finalAmount: deal?.amount || 0,
            actualCloseDate: new Date().toISOString(),
          });
          showSuccess('Fırsat başarıyla kazanıldı olarak işaretlendi!');
        } catch (error) {
          showApiError(error, 'İşlem sırasında bir hata oluştu');
        }
      },
    });
  };

  // Handle close lost
  const handleCloseLost = async () => {
    Modal.confirm({
      title: 'Fırsatı Kaybedildi Olarak İşaretle',
      content: `"${deal?.title}" fırsatını kaybedildi olarak işaretlemek istediğinizden emin misiniz?`,
      okText: 'Kaybedildi İşaretle',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await closeDealLost.mutateAsync({
            id: dealId,
            lostReason: 'Kullanıcı tarafından kapatıldı',
            actualCloseDate: new Date().toISOString(),
          });
          showSuccess('Fırsat kaybedildi olarak işaretlendi');
        } catch (error) {
          showApiError(error, 'İşlem sırasında bir hata oluştu');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Fırsat bulunamadı" />
      </div>
    );
  }

  // Status config
  const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    Open: { color: 'text-blue-700', bg: 'bg-blue-50', icon: <ClockIcon className="w-4 h-4" />, label: 'Açık' },
    Won: { color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <TrophyIcon className="w-4 h-4" />, label: 'Kazanıldı' },
    Lost: { color: 'text-red-700', bg: 'bg-red-50', icon: <XCircleIcon className="w-4 h-4" />, label: 'Kaybedildi' },
  };

  // Priority config
  const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
    Low: { color: 'text-slate-600', bg: 'bg-slate-100', label: 'Düşük' },
    Medium: { color: 'text-amber-700', bg: 'bg-amber-50', label: 'Orta' },
    High: { color: 'text-orange-700', bg: 'bg-orange-50', label: 'Yüksek' },
    Urgent: { color: 'text-red-700', bg: 'bg-red-50', label: 'Acil' },
  };

  const currentStatus = statusConfig[deal.status] || statusConfig.Open;
  const currentPriority = deal.priority ? priorityConfig[deal.priority] : null;

  // Calculate days until close
  const daysUntilClose = deal.expectedCloseDate
    ? dayjs(deal.expectedCloseDate).diff(dayjs(), 'day')
    : null;

  // Expected value
  const expectedValue = (deal.amount * deal.probability) / 100;

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
              onClick={() => router.push('/crm/deals')}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                deal.status === 'Won' ? 'bg-emerald-600' :
                deal.status === 'Lost' ? 'bg-red-500' : 'bg-amber-500'
              }`}>
                <CurrencyDollarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{deal.title}</h1>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${currentStatus.bg} ${currentStatus.color}`}>
                    {currentStatus.icon}
                    {currentStatus.label}
                  </span>
                  {currentPriority && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${currentPriority.bg} ${currentPriority.color}`}>
                      <FlagIcon className="w-3 h-3" />
                      {currentPriority.label}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {deal.customerName || 'Müşteri belirtilmemiş'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {deal.status === 'Open' && (
              <>
                <button
                  onClick={handleCloseWon}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Kazanıldı
                </button>
                <button
                  onClick={handleCloseLost}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <NoSymbolIcon className="w-4 h-4" />
                  Kaybedildi
                </button>
              </>
            )}
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/crm/deals/${dealId}/edit`)}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              Düzenle
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">

          {/* Amount Card - Large */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <CurrencyDollarIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Fırsat Değeri
                </p>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">
                ₺{deal.amount.toLocaleString('tr-TR')}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Beklenen:</span>
                <span className="font-medium text-slate-700">₺{expectedValue.toLocaleString('tr-TR')}</span>
                <span className="text-slate-400">({deal.probability}%)</span>
              </div>
            </div>
          </div>

          {/* Probability Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <ChartBarIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Başarı Olasılığı
                </p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                    deal.probability >= 70
                      ? 'bg-emerald-100 text-emerald-600'
                      : deal.probability >= 40
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {deal.probability}%
                </div>
                <Progress
                  percent={deal.probability}
                  showInfo={false}
                  strokeColor={deal.probability >= 70 ? '#10b981' : deal.probability >= 40 ? '#f59e0b' : '#ef4444'}
                  className="mt-4 w-full"
                />
              </div>
            </div>
          </div>

          {/* Close Date Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Tahmini Kapanış
                </p>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-2">
                {deal.expectedCloseDate ? dayjs(deal.expectedCloseDate).format('DD MMM YYYY') : '-'}
              </div>
              {daysUntilClose !== null && (
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  daysUntilClose > 7 ? 'bg-emerald-50 text-emerald-700' :
                  daysUntilClose > 0 ? 'bg-amber-50 text-amber-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  <ClockIcon className="w-3 h-3" />
                  {daysUntilClose > 0 ? `${daysUntilClose} gün kaldı` : daysUntilClose === 0 ? 'Bugün' : 'Süresi doldu'}
                </div>
              )}
            </div>
          </div>

          {/* Deal Info Card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Fırsat Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Müşteri</p>
                  <div className="flex items-center gap-2">
                    <BuildingStorefrontIcon className="w-4 h-4 text-slate-400" />
                    <p className="text-sm font-medium text-slate-900 m-0">{deal.customerName || '-'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Pipeline</p>
                  <p className="text-sm font-medium text-slate-900">{deal.pipelineName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Aşama</p>
                  <Tag color="blue" className="m-0">{deal.stageName || '-'}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${currentStatus.bg} ${currentStatus.color}`}>
                    {currentStatus.icon}
                    {currentStatus.label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Öncelik</p>
                  {currentPriority ? (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${currentPriority.bg} ${currentPriority.color}`}>
                      <FlagIcon className="w-3 h-3" />
                      {currentPriority.label}
                    </span>
                  ) : (
                    <p className="text-sm text-slate-400">-</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Atanan Kişi</p>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <p className="text-sm font-medium text-slate-900 m-0">{deal.assignedToName || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {deal.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                    <p className="text-xs text-slate-400 m-0">Açıklama</p>
                  </div>
                  <p className="text-sm text-slate-700">{deal.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Kayıt Bilgileri
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Oluşturulma</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(deal.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
                {deal.updatedAt && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Güncelleme</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(deal.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Son Aktivite</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(deal.updatedAt || deal.createdAt).fromNow()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section - Full Width */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              {/* Tab Header */}
              <div className="px-6 pt-4 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Detaylar
                </p>
              </div>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="deal-detail-tabs"
                tabBarStyle={{
                  margin: 0,
                  padding: '0 24px',
                  borderBottom: '1px solid #e2e8f0'
                }}
                items={[
                  {
                    key: 'activities',
                    label: (
                      <span className="flex items-center gap-2 py-1">
                        <ClockIcon className="w-4 h-4" />
                        Aktiviteler
                      </span>
                    ),
                    children: (
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50">
                              <ClockIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-slate-900 m-0">Aktiviteler</h3>
                              <p className="text-xs text-slate-500 m-0">Fırsat ile ilgili tüm aktiviteler</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActivityModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                            Yeni Aktivite
                          </button>
                        </div>

                        {/* Empty State */}
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <ClockIcon className="w-6 h-6 text-slate-400" />
                          </div>
                          <h3 className="text-sm font-medium text-slate-900 mb-1">Aktivite bulunmuyor</h3>
                          <p className="text-sm text-slate-500 mb-4 max-w-sm">
                            Bu fırsat için henüz aktivite kaydı oluşturulmamış.
                          </p>
                          <button
                            onClick={() => setActivityModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                            İlk Aktiviteyi Oluştur
                          </button>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'documents',
                    label: (
                      <span className="flex items-center gap-2 py-1">
                        <DocumentIcon className="w-4 h-4" />
                        Dokümanlar
                      </span>
                    ),
                    children: (
                      <div className="p-6">
                        <DocumentUpload
                          entityId={dealId}
                          entityType="Deal"
                          maxFileSize={10}
                          allowedFileTypes={['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'jpeg']}
                        />
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      <ActivityModal
        open={activityModalOpen}
        activity={null}
        loading={createActivity.isPending}
        onCancel={() => setActivityModalOpen(false)}
        onSubmit={handleActivitySubmit}
      />
    </div>
  );
}
