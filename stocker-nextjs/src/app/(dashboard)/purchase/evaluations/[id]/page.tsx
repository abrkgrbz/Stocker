'use client';

import React from 'react';
import { Dropdown, Modal, Progress, Spin } from 'antd';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  PaperAirplaneIcon,
  PencilIcon,
  StarIcon,
  TrashIcon,
  TrophyIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useParams } from 'next/navigation';
import {
  useSupplierEvaluation,
  useDeleteSupplierEvaluation,
  useSubmitSupplierEvaluation,
  useApproveSupplierEvaluation,
} from '@/lib/api/hooks/usePurchase';
import type { EvaluationStatus } from '@/lib/api/services/purchase.types';

const statusConfig: Record<EvaluationStatus, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Taslak', icon: <PencilIcon className="w-4 h-4" /> },
  Submitted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Gönderildi', icon: <ClockIcon className="w-4 h-4" /> },
  Approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Onaylandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Reddedildi', icon: <XCircleIcon className="w-4 h-4" /> },
};

const evaluationTypeLabels: Record<string, string> = {
  Periodic: 'Periyodik',
  PostDelivery: 'Teslimat Sonrası',
  Annual: 'Yıllık',
  Quarterly: 'Çeyreklik',
  Incident: 'Olay Bazlı',
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Mükemmel';
  if (score >= 60) return 'İyi';
  if (score >= 40) return 'Orta';
  return 'Düşük';
};

const criteriaLabels: Record<string, string> = {
  qualityScore: 'Kalite',
  deliveryScore: 'Teslimat',
  priceScore: 'Fiyat',
  serviceScore: 'Hizmet',
  responsiveness: 'Yanıt Hızı',
  reliability: 'Güvenilirlik',
  flexibility: 'Esneklik',
  documentation: 'Dokümantasyon',
};

export default function SupplierEvaluationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: evaluation, isLoading } = useSupplierEvaluation(id);
  const deleteMutation = useDeleteSupplierEvaluation();
  const submitMutation = useSubmitSupplierEvaluation();
  const approveMutation = useApproveSupplierEvaluation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <StarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Değerlendirme Bulunamadı</h3>
          <p className="text-sm text-slate-500 mb-4">Aradığınız değerlendirme mevcut değil.</p>
          <button
            onClick={() => router.push('/purchase/evaluations')}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Değerlendirmelere Dön
          </button>
        </div>
      </div>
    );
  }

  const status = statusConfig[evaluation.status];

  const handleDelete = () => {
    Modal.confirm({
      title: 'Değerlendirme Silinecek',
      content: 'Bu değerlendirmeyi silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        await deleteMutation.mutateAsync(id);
        router.push('/purchase/evaluations');
      },
    });
  };

  const handleSubmit = () => {
    Modal.confirm({
      title: 'Değerlendirme Gönderilecek',
      content: 'Bu değerlendirmeyi onaya göndermek istediğinize emin misiniz?',
      okText: 'Gönder',
      cancelText: 'İptal',
      onOk: () => submitMutation.mutate(id),
    });
  };

  const handleApprove = () => {
    Modal.confirm({
      title: 'Değerlendirme Onaylanacak',
      content: 'Bu değerlendirmeyi onaylamak istediğinize emin misiniz?',
      okText: 'Onayla',
      cancelText: 'İptal',
      onOk: () => approveMutation.mutate({ id }),
    });
  };

  const scores = {
    qualityScore: evaluation.qualityScore,
    deliveryScore: evaluation.deliveryScore,
    priceScore: evaluation.priceScore,
    serviceScore: evaluation.serviceScore,
    responsiveness: evaluation.responsiveness,
    reliability: evaluation.reliability,
    flexibility: evaluation.flexibility,
    documentation: evaluation.documentation,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <StarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold text-slate-900">{evaluation.evaluationNumber}</h1>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                      {status.icon}
                      {status.label}
                    </span>
                    {evaluation.rank && evaluation.rank <= 3 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                        <TrophyIcon className="w-3 h-3" />
                        #{evaluation.rank} Sıralama
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{evaluation.supplierName}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {evaluation.status === 'Draft' && (
                <>
                  <button
                    onClick={() => router.push(`/purchase/evaluations/${id}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Düzenle
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                    Onaya Gönder
                  </button>
                </>
              )}
              {evaluation.status === 'Submitted' && (
                <button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Onayla
                </button>
              )}
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'delete',
                      label: 'Sil',
                      icon: <TrashIcon className="w-4 h-4" />,
                      danger: true,
                      disabled: evaluation.status !== 'Draft',
                      onClick: handleDelete,
                    },
                  ],
                }}
              >
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <EllipsisHorizontalIcon className="w-5 h-5 text-slate-600" />
                </button>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Overall Score Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="grid grid-cols-12 gap-6 items-center">
                <div className="col-span-12 md:col-span-4">
                  <div className="text-center">
                    <Progress
                      type="circle"
                      percent={evaluation.overallScore}
                      strokeColor={getScoreColor(evaluation.overallScore)}
                      format={() => (
                        <div>
                          <div className="text-3xl font-bold" style={{ color: getScoreColor(evaluation.overallScore) }}>
                            {evaluation.overallScore.toFixed(0)}
                          </div>
                          <div className="text-sm text-slate-500">Genel Puan</div>
                        </div>
                      )}
                      size={160}
                    />
                    <span
                      className="inline-block mt-4 px-3 py-1 text-sm font-medium rounded-full"
                      style={{ backgroundColor: `${getScoreColor(evaluation.overallScore)}20`, color: getScoreColor(evaluation.overallScore) }}
                    >
                      {getScoreLabel(evaluation.overallScore)}
                    </span>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-8">
                  <h3 className="text-sm font-medium text-slate-900 mb-4">Kriter Puanları</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {Object.entries(scores).map(([key, score]) => (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">{criteriaLabels[key]}</span>
                          <span className="font-medium" style={{ color: getScoreColor(score) }}>
                            {score}
                          </span>
                        </div>
                        <Progress
                          percent={score}
                          strokeColor={getScoreColor(score)}
                          showInfo={false}
                          size="small"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-slate-900 mb-4">Değerlendirme Bilgileri</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Değerlendirme No</span>
                  <p className="text-sm font-medium text-slate-900 mt-1">{evaluation.evaluationNumber}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tedarikçi</span>
                  <div className="flex items-center gap-2 mt-1">
                    <BuildingStorefrontIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">{evaluation.supplierName}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tip</span>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {evaluationTypeLabels[evaluation.evaluationType] || evaluation.evaluationType}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Dönem</span>
                  <p className="text-sm font-medium text-slate-900 mt-1">{evaluation.evaluationPeriod || '-'}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Değerlendirme Tarihi</span>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {new Date(evaluation.evaluationDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Değerlendiren</span>
                  <p className="text-sm font-medium text-slate-900 mt-1">{evaluation.evaluatorName || '-'}</p>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-slate-900 mb-4">Değerlendirme Notları</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700">Güçlü Yönler</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {evaluation.strengths || 'Belirtilmemiş'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-red-700">Zayıf Yönler</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {evaluation.weaknesses || 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
              {evaluation.recommendations && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium text-blue-700">Öneriler</span>
                  </div>
                  <p className="text-sm text-slate-600">{evaluation.recommendations}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Status Card */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mx-auto mb-3">
                  <StarIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-white/90 font-medium">{evaluation.evaluationNumber}</p>
                <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Oluşturulma</span>
                  <span className="text-sm font-medium text-slate-900">
                    {evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Son Güncelleme</span>
                  <span className="text-sm font-medium text-slate-900">
                    {evaluation.updatedAt ? new Date(evaluation.updatedAt).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
                {evaluation.approvedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Onay Tarihi</span>
                    <span className="text-sm font-medium text-slate-900">
                      {new Date(evaluation.approvedAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                )}
                {evaluation.approverName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Onaylayan</span>
                    <span className="text-sm font-medium text-slate-900">{evaluation.approverName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {evaluation.notes && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Ek Notlar</h3>
                <p className="text-sm text-slate-600">{evaluation.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
