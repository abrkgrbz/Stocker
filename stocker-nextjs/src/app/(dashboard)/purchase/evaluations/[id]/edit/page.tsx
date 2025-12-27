'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Row,
  Col,
  Spin,
  Progress,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  StarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useSupplierEvaluation,
  useUpdateSupplierEvaluation,
} from '@/lib/api/hooks/usePurchase';
import type { EvaluationStatus } from '@/lib/api/services/purchase.types';

const { TextArea } = Input;

const statusConfig: Record<EvaluationStatus, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Taslak' },
  Submitted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Gönderildi' },
  Approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Onaylandı' },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Reddedildi' },
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

export default function EditSupplierEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const evaluationId = params.id as string;
  const [form] = Form.useForm();

  const { data: evaluation, isLoading: evaluationLoading } = useSupplierEvaluation(evaluationId);
  const updateEvaluation = useUpdateSupplierEvaluation();

  useEffect(() => {
    if (evaluation) {
      form.setFieldsValue({
        notes: evaluation.notes,
      });
    }
  }, [evaluation, form]);

  if (evaluationLoading) {
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

  if (evaluation.status !== 'Draft') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <StarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Düzenleme Yapılamaz</h3>
          <p className="text-sm text-slate-500 mb-4">Sadece taslak durumundaki değerlendirmeler düzenlenebilir.</p>
          <button
            onClick={() => router.push(`/purchase/evaluations/${evaluationId}`)}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Değerlendirmeye Dön
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async (values: any) => {
    try {
      await updateEvaluation.mutateAsync({
        id: evaluationId,
        data: {
          notes: values.notes,
        },
      });

      message.success('Değerlendirme başarıyla güncellendi');
      router.push(`/purchase/evaluations/${evaluationId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/evaluations/${evaluationId}`);
  };

  const isLoading = updateEvaluation.isPending;
  const status = statusConfig[evaluation.status as EvaluationStatus] || statusConfig.Draft;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <StarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">Değerlendirmeyi Düzenle</h1>
                  <p className="text-sm text-slate-500">{evaluation.evaluationNumber}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-4 h-4" />
                İptal
              </button>
              <button
                onClick={() => form.submit()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* Read-Only Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Değerlendirme Bilgileri (Salt Okunur)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tedarikçi</span>
                <p className="text-sm font-medium text-slate-900 mt-1">{evaluation.supplierName}</p>
                {evaluation.supplierCode && (
                  <p className="text-xs text-slate-500">{evaluation.supplierCode}</p>
                )}
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Durum</span>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Genel Puan</span>
                <div className="mt-1">
                  <Progress
                    percent={evaluation.overallScore}
                    size="small"
                    strokeColor={getScoreColor(evaluation.overallScore)}
                  />
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Dönem</span>
                <p className="text-sm font-medium text-slate-900 mt-1">{evaluation.evaluationPeriod || '-'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tip</span>
                <p className="text-sm font-medium text-slate-900 mt-1">{evaluation.evaluationType}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Değerlendirme Tarihi</span>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {new Date(evaluation.evaluationDate).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </div>

          {/* Primary Scores (Read-Only) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-medium text-slate-900 mb-2">Ana Değerlendirme Puanları (Salt Okunur)</h3>
            <p className="text-xs text-slate-500 mb-4">Puanlar değerlendirme oluşturulduktan sonra değiştirilemez.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-slate-500">Kalite</span>
                <Progress percent={evaluation.qualityScore || 0} size="small" strokeColor={getScoreColor(evaluation.qualityScore || 0)} />
              </div>
              <div>
                <span className="text-xs text-slate-500">Teslimat</span>
                <Progress percent={evaluation.deliveryScore || 0} size="small" strokeColor={getScoreColor(evaluation.deliveryScore || 0)} />
              </div>
              <div>
                <span className="text-xs text-slate-500">Fiyat</span>
                <Progress percent={evaluation.priceScore || 0} size="small" strokeColor={getScoreColor(evaluation.priceScore || 0)} />
              </div>
              <div>
                <span className="text-xs text-slate-500">Hizmet</span>
                <Progress percent={evaluation.serviceScore || 0} size="small" strokeColor={getScoreColor(evaluation.serviceScore || 0)} />
              </div>
              <div>
                <span className="text-xs text-slate-500">Yanıt Hızı</span>
                <Progress percent={evaluation.responsiveness || 0} size="small" strokeColor={getScoreColor(evaluation.responsiveness || 0)} />
              </div>
              <div>
                <span className="text-xs text-slate-500">Güvenilirlik</span>
                <Progress percent={evaluation.reliability || 0} size="small" strokeColor={getScoreColor(evaluation.reliability || 0)} />
              </div>
              <div>
                <span className="text-xs text-slate-500">Esneklik</span>
                <Progress percent={evaluation.flexibility || 0} size="small" strokeColor={getScoreColor(evaluation.flexibility || 0)} />
              </div>
              <div>
                <span className="text-xs text-slate-500">Dokümantasyon</span>
                <Progress percent={evaluation.documentation || 0} size="small" strokeColor={getScoreColor(evaluation.documentation || 0)} />
              </div>
            </div>
          </div>

          {/* Editable Feedback */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Değerlendirme Notları</h3>
            <Form.Item
              name="notes"
              label={<span className="text-sm font-medium text-slate-700">Notlar</span>}
            >
              <TextArea
                rows={4}
                placeholder="Değerlendirme notlarını girin..."
              />
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
}
