'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Modal, Input, Spin, message } from 'antd';
import {
  LightBulbIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import {
  useOpportunity,
  useUpdateOpportunityStage,
  useMarkOpportunityAsWon,
  useMarkOpportunityAsLost,
} from '@/features/sales';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const stageLabels: Record<string, { label: string; color: string }> = {
  Lead: { label: 'Aday', color: 'bg-slate-200 text-slate-700' },
  Qualified: { label: 'Nitelikli', color: 'bg-amber-100 text-amber-800' },
  Proposal: { label: 'Teklif', color: 'bg-blue-100 text-blue-800' },
  Negotiation: { label: 'Muzakere', color: 'bg-purple-100 text-purple-800' },
  ClosedWon: { label: 'Kazanildi', color: 'bg-emerald-100 text-emerald-800' },
  ClosedLost: { label: 'Kaybedildi', color: 'bg-red-100 text-red-800' },
};

const stageOrder = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'ClosedWon'];

function formatCurrency(value: number, currency: string = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: opportunity, isLoading } = useOpportunity(id);
  const updateStageMutation = useUpdateOpportunityStage();
  const markWonMutation = useMarkOpportunityAsWon();
  const markLostMutation = useMarkOpportunityAsLost();

  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [lostCompetitor, setLostCompetitor] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-lg">Firsat bulunamadi</p>
          <Link href="/sales/opportunities" className="text-slate-900 hover:underline mt-2 inline-block">
            Listeye don
          </Link>
        </div>
      </div>
    );
  }

  const handleStageChange = async (newStage: string) => {
    try {
      await updateStageMutation.mutateAsync({ id, stage: newStage });
    } catch {
      // Error handled by hook
    }
  };

  const handleMarkWon = async () => {
    try {
      await markWonMutation.mutateAsync({ id });
      message.success('Firsat kazanildi olarak isaretlendi');
    } catch {
      // Error handled by hook
    }
  };

  const handleMarkLost = async () => {
    if (!lostReason) {
      message.error('Kayip nedeni zorunludur');
      return;
    }
    try {
      await markLostMutation.mutateAsync({ id, reason: lostReason, lostToCompetitor: lostCompetitor || undefined });
      setLostModalOpen(false);
      message.success('Firsat kaybedildi olarak isaretlendi');
    } catch {
      // Error handled by hook
    }
  };

  const currentStageIndex = stageOrder.indexOf(opportunity.stage);
  const weightedValue = opportunity.estimatedValue * (opportunity.probability / 100);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{opportunity.title}</h1>
              <p className="text-sm text-slate-500">{opportunity.opportunityNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!opportunity.isWon && !opportunity.isLost && (
              <>
                <button
                  onClick={handleMarkWon}
                  disabled={markWonMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Kazanildi
                </button>
                <button
                  onClick={() => setLostModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <XCircleIcon className="w-4 h-4" />
                  Kaybedildi
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Genel Bilgiler</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Kaynak</p>
                  <p className="text-sm font-medium text-slate-900">{opportunity.source || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Oncelik</p>
                  <p className="text-sm font-medium text-slate-900">{opportunity.priority || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Olusturma Tarihi</p>
                  <p className="text-sm font-medium text-slate-900">
                    {dayjs(opportunity.createdDate).format('DD MMM YYYY')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Son Aktivite</p>
                  <p className="text-sm font-medium text-slate-900">
                    {opportunity.lastActivityDate ? dayjs(opportunity.lastActivityDate).format('DD MMM YYYY') : '-'}
                  </p>
                </div>
              </div>
              {opportunity.description && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Aciklama</p>
                  <p className="text-sm text-slate-700">{opportunity.description}</p>
                </div>
              )}
            </div>

            {/* Stage Timeline */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Asama Sureci</h2>
              <div className="flex items-center justify-between">
                {stageOrder.map((stage, index) => {
                  const isActive = stage === opportunity.stage;
                  const isPast = index < currentStageIndex;
                  const config = stageLabels[stage];
                  return (
                    <div key={stage} className="flex items-center">
                      <button
                        onClick={() => !opportunity.isWon && !opportunity.isLost && handleStageChange(stage)}
                        disabled={opportunity.isWon || opportunity.isLost}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-slate-900 text-white'
                            : isPast
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                        } ${opportunity.isWon || opportunity.isLost ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isActive ? 'bg-white text-slate-900' : isPast ? 'bg-slate-400 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-xs font-medium">{config.label}</span>
                      </button>
                      {index < stageOrder.length - 1 && (
                        <div className={`w-8 h-0.5 mx-1 ${index < currentStageIndex ? 'bg-slate-400' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            {opportunity.notes && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Notlar</h2>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{opportunity.notes}</p>
              </div>
            )}

            {/* Linked Documents */}
            {(opportunity.quotationNumber || opportunity.salesOrderNumber) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Bagli Belgeler</h2>
                <div className="space-y-3">
                  {opportunity.quotationNumber && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TagIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700">Teklif: {opportunity.quotationNumber}</span>
                      </div>
                    </div>
                  )}
                  {opportunity.salesOrderNumber && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TagIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700">Siparis: {opportunity.salesOrderNumber}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Value Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Degerleme</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Tahmini Deger</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(opportunity.estimatedValue, opportunity.currency)}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-500">Olasilik</p>
                  <p className="text-sm font-medium text-slate-900">{opportunity.probability}%</p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-sm text-slate-500">Agirlikli Deger</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {formatCurrency(weightedValue, opportunity.currency)}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserIcon className="w-5 h-5 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Musteri</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">{opportunity.customerName || 'Belirtilmemis'}</p>
                {opportunity.contactName && (
                  <p className="text-sm text-slate-600">Kisi: {opportunity.contactName}</p>
                )}
                {opportunity.contactEmail && (
                  <p className="text-sm text-slate-600">{opportunity.contactEmail}</p>
                )}
                {opportunity.contactPhone && (
                  <p className="text-sm text-slate-600">{opportunity.contactPhone}</p>
                )}
              </div>
            </div>

            {/* Stage Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ArrowTrendingUpIcon className="w-5 h-5 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Asama</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    stageLabels[opportunity.stage]?.color || 'bg-slate-100 text-slate-600'
                  }`}>
                    {stageLabels[opportunity.stage]?.label || opportunity.stage}
                  </span>
                </div>
                {opportunity.salesPersonName && (
                  <div className="pt-2">
                    <p className="text-sm text-slate-500">Satis Temsilcisi</p>
                    <p className="text-sm font-medium text-slate-900">{opportunity.salesPersonName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dates Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDaysIcon className="w-5 h-5 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Tarihler</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-slate-500">Olusturulma</p>
                  <p className="text-sm text-slate-900">{dayjs(opportunity.createdDate).format('DD/MM/YYYY')}</p>
                </div>
                {opportunity.expectedCloseDate && (
                  <div className="flex justify-between">
                    <p className="text-sm text-slate-500">Tahmini Kapanis</p>
                    <p className="text-sm text-slate-900">{dayjs(opportunity.expectedCloseDate).format('DD/MM/YYYY')}</p>
                  </div>
                )}
                {opportunity.actualCloseDate && (
                  <div className="flex justify-between">
                    <p className="text-sm text-slate-500">Gerceklesen Kapanis</p>
                    <p className="text-sm text-slate-900">{dayjs(opportunity.actualCloseDate).format('DD/MM/YYYY')}</p>
                  </div>
                )}
                {opportunity.nextFollowUpDate && (
                  <div className="flex justify-between">
                    <p className="text-sm text-slate-500">Sonraki Takip</p>
                    <p className="text-sm text-slate-900">{dayjs(opportunity.nextFollowUpDate).format('DD/MM/YYYY')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lost Modal */}
      <Modal
        title="Firsat Kaybedildi"
        open={lostModalOpen}
        onOk={handleMarkLost}
        onCancel={() => setLostModalOpen(false)}
        okText="Kaydet"
        cancelText="Vazgec"
        confirmLoading={markLostMutation.isPending}
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kayip Nedeni *</label>
            <Input.TextArea
              rows={3}
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              placeholder="Neden kaybedildi?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rakip</label>
            <Input
              value={lostCompetitor}
              onChange={(e) => setLostCompetitor(e.target.value)}
              placeholder="Hangi rakibe kaybedildi?"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
